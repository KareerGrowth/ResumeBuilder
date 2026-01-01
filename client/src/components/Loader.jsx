import sandGif from '../assets/sand.gif'

const Loader = () => {
  return (
    <div className='flex items-center justify-center h-screen'>
      <img src={sandGif} alt="Loading..." className="w-20 h-20 object-contain" />
    </div>
  )
}

export default Loader
