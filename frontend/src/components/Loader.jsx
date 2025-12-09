function Loader({ message = "Loading..." }) {
  return (
    <div className="text-center py-10">
      <div className="spinner"></div>
      <p className="mt-4 text-primary-600 font-medium">{message}</p>
    </div>
  )
}

export default Loader
