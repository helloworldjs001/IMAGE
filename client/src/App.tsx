import axios from "axios";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component"
import { AiOutlineCloudUpload, AiOutlineFileImage, } from "react-icons/ai";
import { FaEllipsisH } from "react-icons/fa";
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet, useLocation } from "react-router-dom"

const App = () => {
  return (
    <>

      <Router >
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route path="/" element={<AllImages />} />
            <Route path="/upload" element={<ImageUploader />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App


const Layout = () => {
  return (
    <div className="relative h-screen overflow-hidden flex">
      <LeftNavbar />
      <Outlet />
    </div>
  )
}



const LeftNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log(location.pathname);

  return (
    <div className="bg-red-100 h-screen w-12 duration-150 absolute z-10 flex flex-col justify-center hover:w-40">
      <div
        onClick={() => {
          navigate("/upload");
        }}
        className={`flex h-24 items-center justify-center duration-150 overflow-hidden relative hover:bg-red-200 cursor-pointer ${location.pathname === "/upload" ? "bg-red-200" : ""
          }`}
      >
        <span className="absolute left-2 text-3xl">
          <AiOutlineCloudUpload />
        </span>
        <span className="absolute left-12 min-w-32">Upload Image</span>
      </div>
      <div
        onClick={() => {
          navigate("/");
        }}
        className={`flex h-24 items-center justify-center duration-150 overflow-hidden relative hover:bg-red-200 cursor-pointer ${location.pathname === "/" ? "bg-red-200" : ""
          }`}
      >
        <span className="absolute left-2 text-3xl">
          <AiOutlineFileImage />
        </span>
        <span className="absolute left-12 min-w-32">All Images</span>
      </div>
    </div>
  );
};






const AllImages = () => {
  const [Images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);

  const getAllImages = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/images");
      setImages(response.data.images);

    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {

    getAllImages();
  }, []);



  const handleImageClick = (e, id) => {
    e.stopPropagation()
    setSelectedImageId(id);
  };

  const getModalScale = () => {
    console.log(selectedImageId);

    return selectedImageId ? 100 : 0;
  };

  const closeModal = (type: string, title?: string) => {
    if (type == "delete") {

      const newImages = Images.filter(image => image._id !== selectedImageId)

      console.log(newImages, selectedImageId);


      setImages(newImages)
    }

    if (type === "update") {
      const newImages = Images.map(image => {
        if (image._id === selectedImageId) {
          return { ...image, title }
        }
        else {
          return image
        }
      })


      setImages(newImages)

    }
    setSelectedImageId(null);
  };

  return (
    <div className="flex   absolute w-[calc(100vw_-_4rem)] px-4 top-4 right-0">
      <div className="flex h-[98vh]  flex-wrap overflow-y-scroll gap-[4rem]">
        {Images &&
          Images.map((data, key) => {
            return <ImageCard data={data} key={key} onClick={(e) => handleImageClick(e, data._id)} />;
          })}
        {!Images.length && <>
          NO IMAGES
        </>}
      </div>

      {selectedImageId && <Modal _id={selectedImageId} closeModal={closeModal} scale={getModalScale()} />}
    </div>
  );
};



const ImageCard = ({ data, onClick }) => {
  // console.log(data);

  const [hovered, sethovered] = useState(false)

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.keyCode === 27) {
        setIsFullscreen(false);
        sethovered(false)
      }
    };

    if (isFullscreen) {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isFullscreen]);
  return (

    <div onMouseEnter={() => {
      sethovered(true)
    }}
      onMouseLeave={() => {
        sethovered(false)
      }}
      onClick={toggleFullscreen}


      className="w-[25rem] h-fit relative hover:cursor-pointer" >




      {hovered && <div className="  flex justify-between  items-start
       absolute  w-[25rem] " >
        <div className="bg-white h-12  shadow-lg rounded-lg flex items-center justify-between w-[100%] transition-colors px-2 hover:bg-slate-400">


          <button className="text-sm max-w-32 overflow-hidden">
            {data.title || "No Title"}
          </button>
          <button className="text-2xl font-bold" onClick={onClick}>
            <FaEllipsisH />
          </button>
        </div>
      </div>}


      {!isFullscreen && < LazyLoadImage className="aspect-video w-[100%] rounded-lg" src={data.imageUrl}
        alt="Image Alt"
      />}

      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black " onClick={toggleFullscreen}>

          <LazyLoadImage src={data.imageUrl} alt="Fullscreen Image" className="max-h-screen max-w-screen" />
        </div>
      )}


    </div>
  )
}



// type ModalProps = { _id: string }


// Modal component
const Modal = ({ _id, closeModal, scale }) => {


  const [isLoading, setisLoading] = useState(false)

  console.log(scale);

  async function handleDelete() {

    setisLoading(true)

    try {

      const response = await axios.delete(`http://localhost:5000/api/images/${_id}`)


      console.log(response.data);

      closeModal("delete")
      setisLoading(false)

    } catch (error) {

      setisLoading(false)
      console.log(error);

      closeModal(false)


    }
  }

  async function handleUpdateTile() {
    try {
      setisLoading(true)

      const payload = {
        title
      }

      const response = await axios.put(`http://localhost:5000/api/images/${_id}`, payload)


      console.log(response.data);

      setisLoading(false)
      setupdate(false)
      settitle("")

      closeModal("update", response.data.title)

    } catch (error) {

      console.log(error);

      closeModal("fail")

      setisLoading(false)

    }
  }

  const [update, setupdate] = useState(false)
  const [title, settitle] = useState("")

  return (
    <div className={`fixed inset-0 flex items-center justify-center transition-all duration-150 bg-black bg-opacity-75 transform scale-${scale}`}>
      <div className="bg-white bg-opacity-85 w-[500px] h-80 rounded-lg p-8 flex justify-between items-center text-white relative">
        <div className="absolute top-4 h-8 w-8 flex justify-center items-center rounded-2xl cursor-pointer bg-black right-4" onClick={() => { closeModal("fail") }}>X</div>
        {_id && !update &&
          <>
            <button onClick={() => {
              setupdate(true)
            }} className="bg-blue-500 font-extrabold h-16 w-48 px-2 py-4 rounded-xl">Update Image Title</button>
            <button onClick={() => {
              handleDelete()
            }} className="bg-blue-500 font-extrabold h-16 w-48 px-2 py-4 rounded-xl">Delete Image</button>
          </>


        }


        {_id && update && !isLoading &&
          <div className="flex w-[100%] flex-col gap-4">
            <input value={title} onChange={(e) => {
              console.log(e.target.value);

              settitle(e.target.value)
            }} className="w-[100%] h-12 rounded-lg text-black px-5" />
            <div className="flex justify-between gap-2 ">
              <button onClick={() => {
                setupdate(false)
                settitle("")
              }} type="button" className="bg-gray-800 p-4 w-[100%] hover:bg-gray-600 text-white  rounded-md ">Discard</button>
              <button onClick={() => {
                handleUpdateTile()
              }} type="button" className="bg-gray-800 p-4 w-[100%] hover:bg-gray-600 text-white  rounded-md ">Update</button>
            </div>

          </div>
        }

        {isLoading && < Loader />}
      </div>

    </div>
  );
};










const ImageUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [key, setKey] = useState<number>(0);
  const [isLoading, setisLoading] = useState(false)


  const navigate = useNavigate()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  }

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setisLoading(true)
    try {
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', title);

      const response = await axios.post('http://localhost:5000/api/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log(response.data);
      setFile(null); // Clear the file after successful upload
      setTitle(""); // Clear the title after successful upload
      setKey(prevKey => prevKey + 1); // Reset the key of file input to clear its value
      navigate("/")
      setisLoading(false)


    } catch (error) {
      setisLoading(false)
      console.error(error);
    }
  }

  const handleDiscard = () => {
    setFile(null);
    setTitle("");
    setKey(prevKey => prevKey + 1); // Reset the key of file input to clear its value

  }

  return (
    <div className="flex items-center justify-center h-[100%] absolute w-[calc(100vw_-_4rem)] right-0 ">
      <div className="bg-white p-6 w-[600px] rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <input key={key} type="file" onChange={handleFileChange} className="border-gray-300 border p-2 rounded-md" />
          <input type="text" placeholder="Title" value={title} onChange={handleTitleChange} className="border-gray-300 border p-2 rounded-md" />
          {!isLoading && <div className="flex justify-end">
            <button type="button" onClick={handleDiscard} className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-md mr-2">Discard</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md" disabled={!file}>Upload</button>
          </div>}
          {isLoading && <div className="flex justify-end">
            <Loader />
          </div>}
        </form>
      </div>
    </div>
  );
};









const Loader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-600"></div>
      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-600"></div>
      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-600"></div>
    </div>
  )
}
