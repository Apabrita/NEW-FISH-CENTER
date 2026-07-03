const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const navStartToken = '{/* 3. Horizontal Navigation Tabs */}';
const navStartIndex = content.indexOf(navStartToken);

if (navStartIndex !== -1) {
  let navEndIndex = content.indexOf('</nav>', navStartIndex) + '</nav>'.length;
  
  // Let's modify the nav classes while we have it
  let navBlock = content.slice(navStartIndex, navEndIndex);
  
  navBlock = navBlock.replace(
    'className="bg-panel-hover border-b border-divider flex overflow-x-auto whitespace-nowrap custom-scrollbar py-2 px-3.5 z-40 shrink-0 select-none gap-4"',
    'className="glass-panel border-t border-divider flex overflow-x-auto whitespace-nowrap custom-scrollbar py-2 px-3.5 z-40 shrink-0 select-none gap-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"'
  );
  
  // Style the active button to look like an iOS pill
  // Replace the text-sky-600 scale-105 font-black
  navBlock = navBlock.replace(
    /"text-sky-600 scale-105 font-black"/g,
    '"bg-main text-app-bg scale-105 font-black shadow-sm rounded-[16px] px-2 py-1"'
  );
  // Remove the underline indicator
  navBlock = navBlock.replace(/\{\s*isSelected\s*&&\s*\(\s*<div\s*className="absolute\s*bottom-0\s*left-0\s*right-0\s*h-0\.5\s*bg-sky-600\s*rounded-full"\s*\/>\s*\)\s*\}/g, "");
  
  // Remove nav from current position
  content = content.slice(0, navStartIndex) + content.slice(navEndIndex);
  
  // Now find the end of the content wrapper where we should insert the nav.
  // The structure:
  //                 {activeTab === "settings" && ( ... )}
  //               </AnimatePresence>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  
  const endOfAndroidWorkspace = content.indexOf('  // Let\'s implement the Android Specialized Terminal view') > -1 ? false : true;
  // Actually, wait, `renderAndroidWorkspace` is an arrow function:
  // `const renderAndroidWorkspace = () => (` ... `);`
  
  const endOfWorkspaceToken = '  {/* Midnight Rollover Modal Popup */}';
  
  // Wait, let's just insert it right before the second to last `</div>` of the `renderAndroidWorkspace` definition.
  // We can search for:
  // `                        />`
  // `                      </Suspense>`
  // `                    </ErrorBoundary>`
  // `                  )}`
  // `                </Suspense>`
  // `              </ErrorBoundary>`
  // `            </div>`
  // `          </div>`
  
  // Let's use a simpler marker:
  const anchor = 'id="android-viewport-content"';
  const anchorIdx = content.indexOf(anchor);
  const substr = content.slice(anchorIdx);
  const boundary = substr.indexOf('</ErrorBoundary>');
  const afterBoundary = substr.slice(boundary + '</ErrorBoundary>'.length);
  // There are two closing divs.
  const div1 = afterBoundary.indexOf('</div>');
  const div2 = afterBoundary.indexOf('</div>', div1 + 1);
  
  const insertPos = anchorIdx + boundary + '</ErrorBoundary>'.length + div2 + '</div>'.length;
  
  content = content.slice(0, insertPos) + '\n        ' + navBlock + '\n' + content.slice(insertPos);
  
  fs.writeFileSync('src/App.tsx', content);
  console.log("Success");
}
