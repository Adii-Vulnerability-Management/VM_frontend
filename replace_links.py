from pathlib import Path
path = Path('src/pages/admin/dataFlow/dataDictionary/index.js')
text = path.read_text(encoding='utf-8')
lines = text.splitlines()
targets = [
    '/admin/dataFlow/dataCategories',
    '/admin/dataFlow/dataClassifications',
    '/admin/dataFlow/dataSubjects',
    '/admin/dataFlow/dataElements',
    '/admin/dataFlow/purposes/create',
]
changed = False
for i, line in enumerate(lines):
    for target in targets:
        if f'href="{target}"' in line:
            j = i - 1
            while j >= 0 and lines[j].strip() == '':
                j -= 1
            if j >= 0 and '<a' in lines[j]:
                lines[j] = lines[j].replace('<a', '<Link', 1)
                changed = True
            k = i + 1
            while k < len(lines):
                if '</a>' in lines[k]:
                    lines[k] = lines[k].replace('</a>', '</Link>', 1)
                    changed = True
                    break
                k += 1
            break
if changed:
    path.write_text('\n'.join(lines), encoding='utf-8')
