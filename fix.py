import sys

with open('src/views/Settings.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip() == '<span className="font-bold text-sm text-red-600">{t.LOGOUT}</span>':
        start = i
        break

for i in range(start, start+15):
    if "activeSection === 'SERVER_CONNECTION' && (" in lines[i]:
        end = i
        break

replacement = """                  <span className="font-bold text-sm text-red-600">{t.LOGOUT}</span>
                </div>
              </button>
            </div>

          </div>
        ) : (
          <div 
            key={activeSection}
            className={`absolute inset-0 w-full h-full flex flex-col overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-[calc(76px+env(safe-area-inset-bottom)+16px)] space-y-4 settings-active-container`}
          >
"""
lines = lines[:start] + [replacement] + lines[end:]

with open('src/views/Settings.tsx', 'w') as f:
    f.writelines(lines)
