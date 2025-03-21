const Loader = () => {
  return (
    <>
      <div id="loader" className="flex items-center justify-center min-h-screen flex-col">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-solid"></div>
        <div className="mt-4 text-indigo-500">Loading...</div>
      </div>
    </>
  );
};

export default Loader;