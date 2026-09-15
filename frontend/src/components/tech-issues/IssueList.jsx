import IssueCard from "./IssueCard";

export default function IssueList({ issues }) {
  return (
    <div className="space-y-6">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
