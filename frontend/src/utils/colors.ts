export const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "new":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-orange-100 text-orange-800";
    case "published":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
