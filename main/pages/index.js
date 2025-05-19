import Head from 'next/head';

import "bootstrap/dist/css/bootstrap.css";
import layout from '../styles/layout.module.css';

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

    get(child(dbRef, '/data')).then((snapshot) => {
      if (snapshot.exists()) {
        let data_flag = snapshot.hasChild(Date + "|" + Time);
        //console.log(Date + "|" + Time);
        //console.log(data_flag);

        //傳送條件
        if (data_flag != true) {

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

          if (data_flag){
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


  return (
    <main>
      

      <div className="container">

        <div className="row">
          <div className="h2 text-center mt-5 mb-5">雷切機預約|Laser Booking</div>
        </div>

        <div className="row text-center mt-3 h5">
          <div className="col">
            預約須知 ( 須至少一天前預約 )
          </div>
        </div>

        <div className="row mt-5 lu-font justify-content-center">
          <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">
          <li>雷切機使用時間為晚上 19:00-21:00</li>
          <li>請自備隨身碟</li>
          <li>預約者須繳納押金</li>
          <li>結束請帶走個人物品＆協助清潔工具設備</li>
          <li>雷切機管理員將協助您操作設備</li>
          <li>預約未到者將扣押金 50 $</li>
          </div>
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
              <option value="0321">3/21</option>
              <option value="0324">3/24</option>
              <option value="0326">3/26</option>
              <option value="0328">3/28</option>
              <option value="0331">3/31</option>
              <option value="0402">4/2</option>
              <option value="0404">4/4</option>
              <option value="0407">4/7</option>
              <option value="0409">4/9</option>
              <option value="0411">4/11</option>
              <option value="0414">4/14</option>
              <option value="0416">4/16</option>
              <option value="0418">4/18</option>
              <option value="0421">4/21</option>
              <option value="0423">4/23</option>
              <option value="0425">4/25</option>
              <option value="0428">4/28</option>
              <option value="0430">4/30</option>
              <option value="0502">5/2</option>
              <option value="0505">5/5</option>
              <option value="0507">5/7</option>
              <option value="0509">5/9</option>
              <option value="0512">5/12</option>
              <option value="0514">5/14</option>
              <option value="0516">5/16</option>
              <option value="0519">5/19</option>
              <option value="0521">5/21</option>
              <option value="0523">5/23</option>
              <option value="0526">5/36</option>
              <option value="0528">5/28</option>
              <option value="0530">530</option>
              <option value="0602">6/2</option>
              <option value="0604">6/4</option>
              <option value="0607">6/7</option>
              <option value="0609">6/9</option>
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
        
        <div className="row mt-5 text-center h5">
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
        </div>



        <div className="row mt-5 text-center mb-5">
            <div className="col">2303.5 Maker Lab</div>
        </div>



      </div>

      

    </main>
  );
}
