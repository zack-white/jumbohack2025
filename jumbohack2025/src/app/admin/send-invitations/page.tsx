"use client";

import SendInvitations from "../../../components/send-invitations"; // Adjust path if needed

const exampleClub = {
  id: 1,
  name: "JumboCode",
  description: "A club for developers at Tufts.",
};

export default function SendInvitationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Send Invitations</h1>
      <SendInvitations club={exampleClub} />
    </div>
  );
}
