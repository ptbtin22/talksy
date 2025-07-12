const SearchUsersSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-4 animate-pulse">
      <div className="avatar">
        <div className="w-8 h-8 bg-base-200 rounded-full" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-4 w-32 bg-base-200 rounded" />
        <div className="h-3 w-24 bg-base-200 rounded" />
      </div>
    </div>
  );
};

export default SearchUsersSkeleton;
