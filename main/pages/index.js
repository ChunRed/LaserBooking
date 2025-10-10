import Head from 'next/head';

import "bootstrap/dist/css/bootstrap.css";
import layout from '../styles/layout.module.css';
import AutoShowModal from '../components/AutoShowModal'

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, set, push } from "firebase/database";
import Image from 'next/image'

import $ from "jquery";

export default function Home({ allPostsData }) {
  const [ID, setID] = useState("");
  const [Name, setName] = useState("");
  const [Date, setDate] = useState("");
  const [Time, setTime] = useState("");

  const [TimeText, setTimeText] = useState(['', '', '', '']);
  const schedule = ['19:00-20:00 序位1', '19:00-20:00 序位2', '20:00-21:00 序位1', '20:00-21:00 序位2'];

  let firebase_data_length = 0;
  let time = ['19:00-20:00-1', '19:00-20:00-2', '20:00-21:00-1', '20:00-21:00-2'];



  //MARK:FIREBASE INIT
  const firebaseConfig = {
    apiKey: "AIzaSyCI7IR5CAlakx65kVZ1YHKPeBL9F8BxIrg",
    authDomain: "laser-booking-a734f.firebaseapp.com",
    projectId: "laser-booking-a734f",
    storageBucket: "laser-booking-a734f.firebasestorage.app",
    messagingSenderId: "740873118131",
    appId: "1:740873118131:web:f99b46a7cd9d729a622bc6",
    measurementId: "G-05P7LBNJC6"
  };
  const app = initializeApp(firebaseConfig);
  const dbRef = ref(getDatabase());
  const db = getDatabase();



  //MARK:READ DATA
  function readOnceWithGet() {
    const dbRef = ref(getDatabase());

    get(child(dbRef, '/data')).then((snapshot) => {
      if (snapshot.exists()) {

        let data = snapshot.val();
        firebase_data_length = data.length;
        // console.log(data);
        // console.log(firebase_data_length);

      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }



  //MARK:WRITE DATA
  function writeUserData(ID, Name, Date, Time) {
    const today = new globalThis.Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1      //記得 +1，因為 getMonth() 是 0~11）
    const day = today.getDate()


    get(child(dbRef, '/data')).then((snapshot) => {
      if (snapshot.exists()) {
        let data_flag = snapshot.hasChild(Date + "|" + Time);
        //console.log(Date + "|" + Time);
        //console.log(data_flag);

        //傳送條件
        if (data_flag != true) {

          if (parseInt(day) == parseInt(Date[2] + Date[3])) {
            alert('請提前一天預約')
          }
          else {
            if (
              ID != "" &&
              Name != "" &&
              Date != "" &&
              Time != "" &&
              ID.length == 9
            ) {
              set(ref(db, '/data/' + Date + "|" + Time), {
                ID: ID,
                Name: Name,
                Data: Date,
                Time: Time,
              });
              alert('傳送成功')
            }
            else {
              alert('數值有誤，請檢查有無確實填寫資訊')
            }
          }
        }
        else {
          alert('此日期時段預約額滿，請重新選擇日期')
        }

      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }






  function Send() {
    writeUserData(ID, Name, Date, Time);
  }



  function Check(value) {
    let e = document.querySelector("#messages");
    e.innerHTML = "";

    get(child(dbRef, '/data')).then((snapshot) => {

      let ans = [0, 0, 0, 0];
      for (let i = 0; i < time.length; i++) {
        if (snapshot.exists()) {
          let data_flag = snapshot.hasChild(value + "|" + time[i]);

          //console.log(value + "|" + time[i]);

          if (data_flag) {
            ans[i] = 1;
            get(child(dbRef, '/data/' + value + "|" + time[i])).then((snapshot) => {
              let data_message = snapshot.val();
              $('#messages').append($('<li>').text(data_message.Time + " : " + data_message.ID + " : " + data_message.Name));
            });

          }
          else ans[i] = 0;

        } else {
          console.log("No data available");
        }
      }
      //console.log(ans);
      const newTimeText = [...TimeText];
      for (let i = 0; i < ans.length; i++) {
        if (ans[i] == 1) {
          newTimeText[i] = '已額滿';
        }
        else {
          newTimeText[i] = schedule[i];
        }
      }

      setTimeText(newTimeText);
      //console.log(TimeText);


    }).catch((error) => {
      console.error(error);
    });

  }






  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  //  HTML Part  //////  HTML Part  ///////  HTML Part  ///////  HTML Part  
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////



  return (
    <main>


      <div className="container">

        <div className="row">
          <AutoShowModal /> 
        </div>


        <div className="row">
          <div className="h2 text-center mt-5 ">雷切機預約|Laser Booking</div>
        </div>
        


        <div className="row mt-5 justify-content-center">
          <div className="col">
            <div className={layout.hrline}></div>
          </div>
        </div>


        <div className="row mt-5 justify-content-center">
          <div className="w-75 input-group mb-3">
            <input type="text" className="form-control" placeholder="學號｜ID" aria-label="學號｜ID" aria-describedby="button-addon2" onChange={(e) => setID(e.target.value)} ></input>
          </div>
        </div>

        <div className="row mt-2 justify-content-center">
          <div className="w-75 input-group mb-3">
            <input type="text" className="form-control" placeholder="名稱｜Name" aria-label="名稱｜Name" aria-describedby="button-addon2" onChange={(e) => setName(e.target.value)}></input>
          </div>
        </div>

        <div className="row mt-2 justify-content-center">
          <div className="w-75 input-group mb-3">
            <select className="form-select" id="inputGroupSelect04" aria-label="Example select with button addon" defaultValue={'DEFAULT'} onChange={(e) => {
              setDate(e.target.value);
              Check(e.target.value);
            }}>
              <option value="DEFAULT" disabled>選擇日期｜Select date</option>
              <option value="1013">10/13</option>
              <option value="1015">10/15</option>
              <option value="1017">10/17</option>
              <option value="1020">10/20</option>
              <option value="1022">10/22</option>
              <option value="1027">10/27</option>
              <option value="1029">10/29</option>
              <option value="1031">10/31</option>
              <option value="1103">11/3</option>
              <option value="1105">11/5</option>
              <option value="1107">11/7</option>
              <option value="1110">11/10</option>
              <option value="1112">11/12</option>
              <option value="1114">11/14</option>
              <option value="1117">11/17</option>
              <option value="1119">11/19</option>
              <option value="1121">11/21</option>
              <option value="1124">11/24</option>
              <option value="1126">11/26</option>
              <option value="1128">11/28</option>
              <option value="1201">12/1</option>
              <option value="1203">12/3</option>
              <option value="1205">12/5</option>
              <option value="1208">12/8</option>
              <option value="1210">12/10</option>

            </select>
          </div>
        </div>

        <div className="row mt-2 justify-content-center">
          <div className="input-group mb-3 w-75">
            <select className="form-select " id="inputGroupSelect04" aria-label="Example select with button addon" defaultValue={'DEFAULT'} onChange={(e) => setTime(e.target.value)}>
              <option value="DEFAULT" disabled>選擇時間｜Select Time</option>
              <option id={time[0]} value={time[0]}>{TimeText[0]}</option>
              <option id={time[1]} value={time[1]}>{TimeText[1]}</option>
              <option id={time[2]} value={time[2]}>{TimeText[2]}</option>
              <option id={time[3]} value={time[3]}>{TimeText[3]}</option>
            </select>
          </div>
        </div>


        <div className="row mt-5 mb-3 justify-content-center">
          <button className="w-75 btn btn-outline-secondary" type="button" onClick={Send}>傳送｜Send</button>
        </div>




        <div className="row mt-5 text-center h5">
          <div className="col">登記資料</div>
        </div>

        <div className="row mt-3  ">
          <div className={layout.hrline}></div>
        </div>

        <div className="row mt-5 lu-font justify-content-center">
          <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">
            <ul id="messages"></ul>
          </div>
        </div>

        {/* <div className="row mt-5 text-center h5">
          <div className="col">管理員名單</div>
        </div>

        <div className="row mt-3  ">
          <div className={layout.hrline}></div>
        </div>


        <div className="row mt-3  ">
          <Image
            src="/images/list.png"
            alt="管理員名單"
            layout="responsive"
            width={1022}   // 圖片原始寬度
            height={472}   // 圖片原始高度
          />
        </div> */}



        <div className="row mt-5 text-center mb-5">
          <div className="col">2303.5 Maker Lab</div>
        </div>



      </div>



    </main>
  );
}
