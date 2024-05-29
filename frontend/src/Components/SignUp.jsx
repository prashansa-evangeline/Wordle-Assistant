import { useState, useEffect } from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Signup() {

    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();

    async function handleSignup() {
        try {
            const response = await axios.post("https://18.212.87.142:5000/auth/signup", {
                username,
                password,
                email,
                firstname,
                lastname
            });
            print(response)
            navigate("/", { state: { message: 'Signup Successful!' } });
        } catch (error) {
            console.error("Error Creating User", response.data.message);
        }
    }

    useEffect(() => {
        // Apply the background color when the component mounts
        document.body.style.backgroundColor = "black";
    
        // Revert the background color back to default when the component unmounts
        return () => {
          document.body.style.backgroundColor = '';
        };
      }, []);

    return(
        <div className="flex justify-center items-center h-screen">
            <div className='flex flex-col items-center'>
                <div className="text-center text-white text-3xl mb-4">
                    Welcome to <span className='text-green-600'>Wordle</span>. Create your Account Now!
                </div>
                <div className="flex shadow-lg flex-col bg-white border border-gray rounded-lg p-4 m-2">
                    <div>
                        <input onChange={(e) => {setFirstname(e.target.value)}} className="border rounded-md border-gray-300 m-2 p-2" type="text" placeholder="First Name" />
                        <input onChange={(e) => {setLastname(e.target.value)}} className="border rounded-md border-gray-300 m-2 p-2" type="text" placeholder="Last Name" />
                    </div>
                    <input onChange={(e) => {setUsername(e.target.value)}} className="border rounded-md border-gray-300 m-2 p-2" type="text" placeholder="Username" />
                    <input  onChange={(e) => {setEmail(e.target.value)}} className="border rounded-md border-gray-300 m-2 p-2" type="text" placeholder="Email" />
                    <input onChange={(e) => {setPassword(e.target.value)}} className="border rounded-md border-gray-300 m-2 p-2" type="password" placeholder="Password" />
                    <button onClick={handleSignup} className="border bg-green-600 font-bold text-white rounded-md border-green-600 m-4 mt-4 p-2">Sign Up</button>
                </div>
            </div>
        </div>
    )
}

export default Signup