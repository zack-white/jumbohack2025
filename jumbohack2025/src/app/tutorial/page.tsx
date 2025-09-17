'use client';

import Image from 'next/image';

export default function TutorialPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full py-6">
        <div className="px-[10vw]">
          <div>
            <h1 className="text-2xl text-gray-900 mb-6 md:text-3xl font-serif font-bold pt-2 text-primary">
              JumboMap Instructions
            </h1>
          </div>

          {/* Two Modes Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Two Modes</h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-start mb-8">
              {/* Image placeholder */}
                <div className="h-full min-h-[200px] rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                    <img
                        src="/images/homepage.png"
                        alt="JumboMap Homepage"
                        className="object-contain h-full w-full"
                    />
                </div>
              
              <div className="space-y-6">
                <div className="border border-gray-200 p-6 rounded-lg bg-white">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Admin View</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Sign up/in to access</li>
                    <li>• Best viewed on desktop</li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 p-6 rounded-lg bg-white">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Student View</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• No sign in necessary</li>
                    <li>• Can view on either desktop or mobile</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Sign up/in Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Sign up/in</h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <p className="text-gray-700">
                  Click the "Sign in" button at the top right corner to log in or create an account. Currently, anyone can create an account and start making events that will show up on our landing page. Single sign-on with Google or with an email address/username.
                </p>
              </div>
              
              {/* Image placeholder */}
              <div className="h-full min-h-[200px] rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                    <img
                        src="/images/signup.gif"
                        alt="JumboMap Sign Up/Sign In"
                        className="object-contain h-full w-full"
                    />
               </div>
            </div>
          </section>

          {/* Admin Workflow Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Admin Workflow</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Getting Started</h3>
                
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Sign in</li>
                    <li>Click on "Create an Event"</li>
                    <li>Fill out all required information</li>
                    <li>Can upload your own spreadsheet (example format provided below)</li>
                    <li>Choose a location anywhere in the world!</li>
                  </ol>
                  
                  {/* Image placeholder */}
                  <div className="h-full min-h-[200px] rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                    <img
                        src="/images/create-event.gif"
                        alt="JumboMap Create Event"
                        className="object-contain h-full w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Placing Tables</h3>
                
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Image placeholder */}
                  <div className="h-full min-h-[200px] rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                    <img
                        src="/images/placing.gif"
                        alt="JumboMap Create Event"
                        className="object-contain h-full w-full"
                    />
                  </div>
                  
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Select a category to see a section of tables to place</li>
                    <li>Click on a location on the map to start placing tables from that category in order</li>
                    <li>Click "Save" to store your pin-placing progress</li>
                    <li>Click on a previously placed table and click "Move" to modify its positioning</li>
                    <li>Once all of the tables are placed, click "Submit" to finalize the layout</li>
                  </ol>
                  Note: You can always come back to edit the table placements later.
                </div>
              </div>

              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Adding More Tables</h3>
                
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Before leaving the table placement screen, if you want to add more tables to your event, click the "+ Table" button</li>
                    <li>Within the pop-up window, fill out the listed fields</li>
                    <li>Click "Add Table" when finished, and confirm your additions are correct</li>
                    <li>Now, from the table placement screen, your newly-added table will be in the list of unplaced tables for your event</li>
                  </ol>
                  
                  {/* Image placeholder */}
                  <div className="h-full min-h-[200px] rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                    <img
                        src="/images/addtables.gif"
                        alt="JumboMap Add Table"
                        className="object-contain h-full w-full"
                    />
                  </div>
                </div>
                
              </div>

              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Automated Email Process</h3>
                
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <ul className="space-y-2 text-gray-700">
                    <li>• Every table placed will automatically be sent an email asking them to confirm if they are coming to the event</li>
                    <li>• If they deny, their table will automatically be removed</li>
                    <li>• If they confirm, they have the option to submit a description to their table</li>
                  </ul>
                  
                  {/* Image placeholder */}
                  <div className="h-32 md:h-36 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Managing Events</h3>
                
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Image placeholder */}
                  <div className="h-full min-h-[200px] rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                    <img
                        src="/images/managing.gif"
                        alt="JumboMap Managing Events"
                        className="object-contain h-full w-full"
                    />
                  </div>
                  
                  <ul className="space-y-2 text-gray-700">
                    <li>• From the landing page while logged in, you can click on your event to view details</li>
                    <li>• If your event is not visible in the top 3, click "See All Events" in the top right</li>
                    <li>• From the event view page, click "Edit Event" to modify your event details</li>
                    <li>• From here, you will be able to move and continue placing tables on the map</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Optional Features Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Optional Features</h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <ul className="space-y-3 text-gray-700">
                    <li>• Return to your event page</li>
                    <li>• To add new information to existing tables from the spreadsheet, click on a table pinpoint on the map and edit the details</li>
                    <li>• To adjust the positioning of a table, click the pin and then "Move". Then, click the new location on the map and then confirm with "Save" at the bottom.</li>
                    <li>• To add more tables to your event, click the "+ Table" button</li>
                </ul>
              </div>
              
              {/* Image placeholder */}
              <div className="h-full min-h-[200px] rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                    <img
                        src="/images/edittable.gif"
                        alt="JumboMap Managing Events"
                        className="object-contain h-full w-full"
                    />
                  </div>
            </div>
          </section>

          {/* Spreadsheet Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Spreadsheet Format</h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Image placeholder */}
              <div className="h-full min-h-[200px] rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                    <img
                        src="/images/spreadsheet.png"
                        alt="JumboMap Managing Events"
                        className="object-contain h-full w-full"
                    />
                  </div>
              
              <div className="space-y-6">
                <div className="border border-gray-200 p-6 rounded-lg bg-white">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Format (no table timings - 3 columns)</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <ul className="space-y-2 text-gray-700">
                      <li>1. <strong>Table name</strong></li>
                      <li>2. <strong>Purpose / category</strong></li>
                      <li>3. <strong>Email contact</strong></li>
                      <li>4. <strong>Description</strong> (optional)</li>
                    </ul>
                  </div>
                </div>

                <div className="border border-gray-200 p-6 rounded-lg bg-white">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Table Timings Format (for when tables aren't available for the entire event)</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <ul className="space-y-2 text-gray-700">
                      <li>1. <strong>Table Name</strong></li>
                      <li>2. <strong>Purpose / category</strong></li>
                      <li>3. <strong>Email contact</strong></li>
                      <li>4. <strong>Start Time</strong> (HH:MM)</li>
                      <li>5. <strong>End Time</strong> (HH:MM)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* User Workflow Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">User Workflow</h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li>Find the event on the landing page</li>
                  <li>On event page, view all clubs attending and search</li>
                  <li>Can go to map view to see all clubs on the map</li>
                  <li>Can search and see their descriptions if their pins are clicked on</li>
                </ol>
              </div>
              
              {/* Image placeholder */}
              <div className="h-full min-h-[200px] rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                    <img
                        src="/images/workflow.png"
                        alt="JumboMap Managing Events"
                        className="object-contain h-full w-full"
                    />
                  </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
