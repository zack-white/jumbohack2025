'use client';

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

          {/* Placeholder for header image */}
          <div className="relative mb-8 flex justify-center">
            <div className="w-full h-32 md:h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-center">
                [Tutorial Header Image]<br />
                <span className="text-sm">Image placeholder - tutorial overview</span>
              </p>
            </div>
          </div>

          {/* Two Modes Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Two Modes</h2>
            
            {/* Image placeholder */}
            <div className="w-full h-24 md:h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6">
              <p className="text-gray-500 text-center text-sm">
                [Two Modes Comparison Image]
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
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
          </section>

          {/* Sign up/in Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Sign up/in</h2>
            
            {/* Image placeholder */}
            <div className="w-full h-24 md:h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6">
              <p className="text-gray-500 text-center text-sm">
                [Sign Up/Sign In Process Image]
              </p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg bg-white">
              <p className="text-gray-700">
                Currently anyone can create an account and start making events that will show up on our landing page.
              </p>
            </div>
          </section>

          {/* Admin Workflow Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Admin Workflow</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Getting Started</h3>
                
                {/* Image placeholder */}
                <div className="w-full h-20 md:h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500 text-center text-sm">
                    [Event Creation Process Image]
                  </p>
                </div>
                
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Sign up/in</li>
                  <li>Click on "Create an Event"</li>
                  <li>Fill out all required information</li>
                  <li>Can upload your own spreadsheet (example format provided below)</li>
                  <li>Choose a location anywhere in the world!</li>
                </ol>
              </div>

              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Placing Tables</h3>
                
                {/* Image placeholder */}
                <div className="w-full h-20 md:h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500 text-center text-sm">
                    [Table Placement Map Image]
                  </p>
                </div>
                
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Start placing tables on the map</li>
                  <li>Select a category to see a section of clubs to place</li>
                  <li>Once you are done hit submit</li>
                </ol>
              </div>

              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Automated Email Process</h3>
                
                {/* Image placeholder */}
                <div className="w-full h-20 md:h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500 text-center text-sm">
                    [Email Confirmation Flow Image]
                  </p>
                </div>
                
                <ul className="space-y-2 text-gray-700">
                  <li>• Every table placed will automatically be sent an email asking them to confirm if they are coming to the event</li>
                  <li>• If they deny, their table will automatically be removed</li>
                  <li>• If they confirm, they have the option to submit a description to their table</li>
                </ul>
              </div>

              <div className="border border-gray-200 p-6 rounded-lg bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Managing Events</h3>
                
                {/* Image placeholder */}
                <div className="w-full h-20 md:h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500 text-center text-sm">
                    [Event Management Dashboard Image]
                  </p>
                </div>
                
                <p className="text-gray-700">
                  On landing page, you can select the created event to go back and edit it.
                </p>
              </div>
            </div>
          </section>

          {/* Optional Features Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Optional Features</h2>
            
            {/* Image placeholder */}
            <div className="w-full h-20 md:h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6">
              <p className="text-gray-500 text-center text-sm">
                [Table Editing Features Image]
              </p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg bg-white">
              <ul className="space-y-3 text-gray-700">
                <li>• If you have new information from a table not in the spreadsheet, you can edit tables if you are logged in on the event you created</li>
                <li>• You can also add new tables in the same manner</li>
              </ul>
            </div>
          </section>

          {/* Spreadsheet Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">Spreadsheet Format</h2>
            
            {/* Image placeholder */}
            <div className="w-full h-24 md:h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6">
              <p className="text-gray-500 text-center text-sm">
                [Spreadsheet Example Image]
              </p>
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
          </section>

          {/* User Workflow Section */}
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 text-gray-900">User Workflow</h2>
            
            {/* Image placeholder */}
            <div className="w-full h-24 md:h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6">
              <p className="text-gray-500 text-center text-sm">
                [Student User Journey Image]
              </p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg bg-white">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Find the right event on the landing page</li>
                <li>On event page can view all clubs attending and search</li>
                <li>Can go to map view to see all clubs on the map</li>
                <li>Can search and see their descriptions if their pins are clicked on</li>
              </ol>
            </div>
          </section>

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600 italic">
              Images will be added throughout these instructions to help illustrate each step.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
