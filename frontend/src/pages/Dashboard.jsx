import { useEffect, useState } from "react";
import axios from "axios";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import { Appbar } from "../components/AppBar";

export const Dashboard = () => {
  const [amount, setAmount] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3000/api/v1/account/balance", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("token")    
            }
        })
      .then(response => {
        setAmount(response.data.message);
      })
      .catch(err => {
        console.error("Error fetching balance:", err);
      });
  }, []);

  return (
    <div>
      <Appbar />
      <div className="m-6">
        <Balance value={amount} />
        <Users />
      </div>
    </div>
  );
};
