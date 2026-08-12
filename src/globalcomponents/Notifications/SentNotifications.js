import { useEffect, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";

const SentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/notifications`,
        );
        const list =
          res.data?.notifications ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);
        setNotifications(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setNotifications([]);
      }
    };
    load();
  }, []);

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Sent Notifications</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Action</th>
            <th className="p-2 border">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification, idx) => (
            <tr key={notification.id || idx} className="border">
              <td className="p-2 border">{notification.id ?? "-"}</td>
              <td className="p-2 border">{notification.action ?? "-"}</td>
              <td className="p-2 border">
                {notification.timestamp
                  ? new Date(notification.timestamp).toLocaleString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SentNotifications;
