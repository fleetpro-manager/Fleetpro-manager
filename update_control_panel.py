import sys

with open('src/views/ControlPanel.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'setCustomBackAction' in line and '} = useStore();' in lines[i+1]:
        lines[i] = line.replace('setCustomBackAction', 'setCustomBackAction,\n    setCustomHeaderTitle')
        break

for i, line in enumerate(lines):
    if 'return (' in line and 'const hideControlPanelHeaderCard' in lines[i-2]:
        insert_idx = i - 2
        break

new_use_effect = """
  useEffect(() => {
    let title: string | null = null;
    if (selectedBankForBranch) {
      title = `${selectedBankForBranch} BRANCHES`;
    } else if (selectedCountryForBank) {
      title = `${selectedCountryForBank} BANKS`;
    } else if (selectedCountryForAddress) {
      title = `${selectedCountryForAddress} REGIONS`;
    } else if (activeTab && currentTab) {
      title = currentTab.label;
    } else if (activeCategory && currentCategory) {
      title = currentCategory.label;
    }
    
    setCustomHeaderTitle(title);
    return () => {
      setCustomHeaderTitle(null);
    };
  }, [selectedBankForBranch, selectedCountryForBank, selectedCountryForAddress, activeTab, currentTab, activeCategory, currentCategory, setCustomHeaderTitle]);

"""

lines.insert(insert_idx, new_use_effect)

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '{(activeTab || activeCategory) && !hideControlPanelHeaderCard && (' in line:
        start_idx = i
        break

if start_idx != -1:
    open_brackets = 0
    for i in range(start_idx, len(lines)):
        open_brackets += lines[i].count('(') - lines[i].count(')')
        if open_brackets == 0:
            end_idx = i
            break
            
    if end_idx != -1:
        del lines[start_idx:end_idx+1]
        
for i, line in enumerate(lines):
    if 'const hideControlPanelHeaderCard =' in line:
        del lines[i]
        break

with open('src/views/ControlPanel.tsx', 'w') as f:
    f.writelines(lines)
