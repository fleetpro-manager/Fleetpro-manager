import sys

with open('src/views/Settings.tsx', 'r') as f:
    lines = f.readlines()

filtered = []
skip = False
for line in lines:
    if "{activeSection === 'SERVER_CONNECTION' && (1>" in line:
        skip = True
        continue
    if skip and "</div>" in line:
        continue
    if skip and ")}" in line:
        skip = False
        continue
    filtered.append(line)

with open('src/views/Settings.tsx', 'w') as f:
    f.writelines(filtered)
