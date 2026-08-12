import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../../BaseUrl";

/** ========= API LAYER (swap with your own) ========= **/
const baseURL = "https://dev.grc3.io";
const REORDER_URL = `${baseURL}/${initURL}/governance-hub/organizations/reorder-batch`;

const orgApi = {
  // POST /reorder-batch  { items: [{ _id, parentId, sortIndex }] }
  async reorderBatchByItems(items) {
    const r = await fetch(REORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!r.ok) throw new Error(`reorderBatchByItems failed: ${r.status}`);
    return r.json().catch(() => ({}));
  },
  // POST /reorder-batch  { roots: [{ _id, children: [...] }] }
  async reorderBatchByTree(roots) {
    const r = await fetch(REORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roots }),
    });
    if (!r.ok) throw new Error(`reorderBatchByTree failed: ${r.status}`);
    return r.json().catch(() => ({}));
  },
};
/** ================================================== **/

/** Helpers */
function flatten(nodes, parentId = null) {
  return nodes.flatMap((n, idx) => [
    {
      id: n._id,
      parentId,
      index: idx,
      name: n.name,
      code: n.code,
      children: n.children || [],
    },
    ...flatten(n.children || [], n._id),
  ]);
}

function deepCloneTree(tree) {
  return tree.map((n) => ({
    ...n,
    children: n.children ? deepCloneTree(n.children) : [],
  }));
}

/** Find node and parent by id */
function findNodeAndParent(tree, targetId, parent = null) {
  for (const node of tree) {
    if (node._id === targetId) return { node, parent };
    if (node.children?.length) {
      const hit = findNodeAndParent(node.children, targetId, node);
      if (hit) return hit;
    }
  }
  return null;
}

/** Insert at index into array (bounded) */
function insertAt(arr, index, item) {
  const next = [...arr];
  const i = Math.max(0, Math.min(index, next.length));
  next.splice(i, 0, item);
  return next;
}

/** Remove item by _id from array (once) */
function removeById(arr, id) {
  const next = [...arr];
  const idx = next.findIndex((x) => x._id === id);
  if (idx >= 0) next.splice(idx, 1);
  return next;
}

/** Move a node across the tree; returns newTree + affected parent ids */
function moveNode(tree, nodeId, destParentId, destIndex) {
  const draft = deepCloneTree(tree);

  const hit = findNodeAndParent(draft, nodeId);
  if (!hit) return { tree: draft, affectedParentIds: new Set() };

  const { node, parent: srcParent } = hit;

  // Remove from source
  let newDraft = draft;
  let srcParentId = null;
  if (srcParent) {
    srcParent.children = removeById(srcParent.children, nodeId);
    srcParentId = srcParent._id;
  } else {
    // node was a root
    newDraft = removeById(draft, nodeId);
    srcParentId = null;
  }

  // Find destination parent
  if (destParentId) {
    const destHit = findNodeAndParent(newDraft, destParentId);
    if (!destHit) {
      // if destination parent not found, no-op
      return { tree: newDraft, affectedParentIds: new Set([srcParentId]) };
    }
    const destParent = destHit.node; // dest parent is the node itself
    destParent.children = insertAt(destParent.children || [], destIndex, node);
  } else {
    // insert as a root
    newDraft = insertAt(newDraft, destIndex, node);
  }

  const affected = new Set([srcParentId, destParentId]);
  return { tree: newDraft, affectedParentIds: affected };
}

/** Build minimal items payload for changed sibling lists */
function buildItemsPayload(tree, affectedParentIds) {
  const items = [];

  // helper to push siblings with correct sortIndex
  const pushSiblings = (siblings, parentId) => {
    siblings.forEach((n, sortIndex) => {
      items.push({ _id: n._id, parentId: parentId ?? null, sortIndex });
    });
  };

  const visit = (nodes, currentParentId = null) => {
    // if current list is affected, emit its ordering
    if (affectedParentIds.has(currentParentId)) {
      pushSiblings(nodes, currentParentId);
    }
    for (const n of nodes) {
      if (n.children?.length) visit(n.children, n._id);
    }
  };

  visit(tree, null);
  // In case a parent has no children post-move but is affected, ensure we still send empty set? Not required for "items".
  return items;
}

/** Build full roots payload */
function toRootsPayload(tree) {
  const mapNode = (n) => ({
    _id: n._id,
    children: (n.children || []).map(mapNode),
  });
  return tree.map(mapNode);
}

const OrgHierarchy = ({
  tree,
  refresh,
  apiMode = "items" /* 'items' | 'roots' */,
}) => {
  // keep a local optimistic copy so UI reorders instantly
  const [localTree, setLocalTree] = useState(tree);

  useEffect(() => {
    setLocalTree(tree);
  }, [tree]);

  const flat = useMemo(() => flatten(localTree), [localTree]);
  const byId = useMemo(
    () => Object.fromEntries(flat.map((n) => [n.id, n])),
    [flat],
  );

  const handleDragEnd = async (result) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;

    const destParentId =
      destination.droppableId === "ROOT" ? null : destination.droppableId;
    const destIndex = destination.index;

    // nothing changed
    if (
      source.droppableId === destination.droppableId &&
      source.index === destIndex
    )
      return;

    // 1) Optimistically reorder locally
    const { tree: movedTree, affectedParentIds } = moveNode(
      localTree,
      draggableId,
      destParentId,
      destIndex,
    );
    setLocalTree(movedTree);

    // 2) Build payload(s)
    try {
      if (apiMode === "items") {
        const items = buildItemsPayload(movedTree, affectedParentIds);
        // If you want to send ONLY the moved item instead:
        // const items = [{ _id: draggableId, parentId: destParentId, sortIndex: destIndex }];
        await orgApi.reorderBatchByItems(items);
      } else {
        const roots = toRootsPayload(movedTree);
        await orgApi.reorderBatchByTree(roots);
      }

      toast.success("Organization order updated");
      await refresh(); // sync from server
    } catch (e) {
      console.error(e);
      toast.error("Failed to update order");
      // revert UI on failure
      setLocalTree(tree);
    }
  };

  const renderLevel = (nodes, droppableId) => (
    <Droppable droppableId={droppableId} type="ORG">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="pl-4"
        >
          {nodes.map((n, idx) => (
            <Draggable key={n._id} draggableId={n._id} index={idx}>
              {(drag) => (
                <div
                  ref={drag.innerRef}
                  {...drag.draggableProps}
                  {...drag.dragHandleProps}
                  className="border rounded-md p-3 mb-2 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{n.name}</div>
                    <div className="text-xs text-gray-500">{n.code}</div>
                  </div>
                  {/* children drop-zone */}
                  {renderLevel(n.children || [], n._id)}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {renderLevel(localTree, "ROOT")}
    </DragDropContext>
  );
};

export default OrgHierarchy;
