import { useState, useEffect } from 'react';
import Head from 'next/head';
import "bootstrap/dist/css/bootstrap.css";
// Firebase imports
import { initializeApp, getApps } from "firebase/app";
import defaultDates from '../data/dates.json';
import { getDatabase, ref, child, get, remove, set } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCI7IR5CAlakx65kVZ1YHKPeBL9F8BxIrg",
    authDomain: "laser-booking-a734f.firebaseapp.com",
    projectId: "laser-booking-a734f",
    storageBucket: "laser-booking-a734f.firebasestorage.app",
    messagingSenderId: "740873118131",
    appId: "1:740873118131:web:f99b46a7cd9d729a622bc6",
    measurementId: "G-05P7LBNJC6"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
}

// Ensure database reference is available
// It's safer to get the database instance inside components or functions to ensure app is initialized,
// but for global scope here, we rely on the above check.
const db = getDatabase();

export default function ManageDates() {
    const [dates, setDates] = useState([]);
    const [newDate, setNewDate] = useState('');
    const [message, setMessage] = useState('');

    // Booking management state
    const [selectedDateBookings, setSelectedDateBookings] = useState(null);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [currentViewingDate, setCurrentViewingDate] = useState(null); // The date we are currently viewing

    // Hardcoded time slots matching index.js logic
    const timeSlots = ['19:00-20:00-1', '19:00-20:00-2', '20:00-21:00-1', '20:00-21:00-2'];

    useEffect(() => {
        fetchDates();
    }, []);

    const fetchDates = async () => {
        try {
            const dbRef = ref(getDatabase());
            const snapshot = await get(child(dbRef, 'availableDates'));
            if (snapshot.exists()) {
                setDates(snapshot.val());
            } else {
                // Determine fallback: use local JSON file if Firebase is empty (initial migration)
                console.log("No dates in Firebase, using default from dates.json");
                setDates(defaultDates || []);
            }
        } catch (error) {
            console.error(error);
            setMessage('Error fetching dates');
        }
    };

    const addDate = () => {
        if (!newDate) return;
        if (!/^\d{4}$/.test(newDate)) {
            alert('請輸入 4 位數字格式 (MMDD)，例如 1201');
            return;
        }

        if (dates.includes(newDate)) {
            alert('此日期已存在');
            return;
        }

        const updatedDates = [...dates, newDate].sort();
        setDates(updatedDates);
        setNewDate('');
    };

    const removeDate = (dateToRemove) => {
        // Confirmation before removing date? Maybe not strictly required but UX friendly
        if (!confirm(`確定要刪除日期 ${dateToRemove} 嗎？這不會刪除該日期的預約資料，僅從列表中移除。`)) return;

        const updatedDates = dates.filter(date => date !== dateToRemove);
        setDates(updatedDates);

        // If we are viewing the removed date, clear the view
        if (currentViewingDate === dateToRemove) {
            setSelectedDateBookings(null);
            setCurrentViewingDate(null);
        }
    };

    const saveDates = async () => {
        setMessage('Applying changes...');
        try {
            const db = getDatabase();
            await set(ref(db, 'availableDates'), dates);
            setMessage('更新成功！ Dates updated successfully (saved to Firebase).');
        } catch (error) {
            console.error(error);
            setMessage(`Update failed: ${error.message}`);
        }
    };

    // Firebase Booking Logic
    const viewBookings = (date) => {
        setCurrentViewingDate(date);
        setLoadingBookings(true);
        setSelectedDateBookings({}); // Reset current view

        const dbRef = ref(getDatabase()); // Get fresh ref

        // We need to check all 4 slots for this date
        const promises = timeSlots.map(slot => {
            const key = `${date}|${slot}`;
            return get(child(dbRef, `/data/${key}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    return { slot, data: snapshot.val(), key };
                } else {
                    return { slot, data: null, key };
                }
            });
        });

        Promise.all(promises).then((results) => {
            const bookings = {};
            results.forEach(result => {
                bookings[result.slot] = result;
            });
            setSelectedDateBookings(bookings);
            setLoadingBookings(false);
        }).catch((error) => {
            console.error(error);
            setMessage('Error fetching booking data');
            setLoadingBookings(false);
        });
    };

    const deleteBooking = (key) => {
        if (!confirm('確定要刪除這筆預約嗎？ / Are you sure you want to delete this booking?')) return;

        remove(ref(db, `/data/${key}`))
            .then(() => {
                alert('刪除成功 / Booking deleted');
                // Refresh the view
                if (currentViewingDate) {
                    viewBookings(currentViewingDate);
                }
            })
            .catch((error) => {
                console.error(error);
                alert('刪除失敗 / Delete failed');
            });
    };

    return (
        <div className="container mt-5 mb-5">
            <Head>
                <title>Manage Dates & Bookings</title>
            </Head>

            <div className="row justify-content-center">
                <div className="col-md-10">
                    <h2 className="mb-4 text-center">日期與預約管理 (Date & Booking Management)</h2>

                    {message && <div className="alert alert-info">{message}</div>}

                    <div className="row">
                        {/* Left Column: Date Management */}
                        <div className="col-md-6">
                            <div className="card mb-4">
                                <div className="card-header bg-primary text-white">
                                    日期設定 (Date Settings)
                                </div>
                                <div className="card-body">
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="MMDD (e.g. 1201)"
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') addDate();
                                            }}
                                        />
                                        <button className="btn btn-primary" type="button" onClick={addDate}>
                                            新增 / Add
                                        </button>
                                    </div>
                                    <small className="text-muted d-block mb-3">格式 Format: 4 位數字 (MMDD)</small>

                                    <ul className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {dates.map((date) => (
                                            <li key={date} className={`list-group-item d-flex justify-content-between align-items-center ${currentViewingDate === date ? 'bg-light' : ''}`}>
                                                <span>
                                                    {date.substring(0, 2)}/{date.substring(2, 4)}
                                                    <span className="text-muted ms-2">({date})</span>
                                                </span>
                                                <div>
                                                    <button
                                                        className="btn btn-info btn-sm me-2 text-white"
                                                        onClick={() => viewBookings(date)}
                                                    >
                                                        查看 / View
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => removeDate(date)}>
                                                        刪除 / Del
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="d-grid gap-2 mt-4">
                                        <button className="btn btn-success" onClick={saveDates}>
                                            儲存日期變更 / Save Dates
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Booking Details */}
                        <div className="col-md-6">
                            <div className="card sticky-top" style={{ top: '20px' }}>
                                <div className="card-header bg-info text-white">
                                    {currentViewingDate
                                        ? `預約情形: ${currentViewingDate.substring(0, 2)}/${currentViewingDate.substring(2, 4)}`
                                        : '預約詳情 (Booking Details)'}
                                </div>
                                <div className="card-body">
                                    {!currentViewingDate && (
                                        <p className="text-center text-muted my-5">
                                            請從左側列表選擇日期以查看預約<br />
                                            Select a date from the list to view bookings
                                        </p>
                                    )}

                                    {loadingBookings && (
                                        <div className="text-center my-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    )}

                                    {!loadingBookings && currentViewingDate && selectedDateBookings && (
                                        <div className="vstack gap-3">
                                            {timeSlots.map((slot, index) => {
                                                const booking = selectedDateBookings[slot];
                                                const hasData = booking && booking.data;
                                                // Format slot name for display
                                                // slot format: 19:00-20:00-1
                                                const displayTime = slot.split('-').slice(0, 2).join('-');
                                                const seat = slot.split('-')[2];

                                                return (
                                                    <div key={slot} className={`card ${hasData ? 'border-danger' : 'border-success'}`}>
                                                        <div className="card-body p-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <h6 className="card-title m-0">
                                                                    {displayTime} (序位 {seat})
                                                                </h6>
                                                                <span className={`badge ${hasData ? 'bg-danger' : 'bg-success'}`}>
                                                                    {hasData ? '已預約 / Booked' : '空位 / Available'}
                                                                </span>
                                                            </div>

                                                            {hasData ? (
                                                                <div className="small">
                                                                    <div className="mb-1"><strong>ID:</strong> {booking.data.ID}</div>
                                                                    <div className="mb-2"><strong>Name:</strong> {booking.data.Name}</div>
                                                                    <button
                                                                        className="btn btn-outline-danger btn-sm w-100"
                                                                        onClick={() => deleteBooking(booking.key)}
                                                                    >
                                                                        取消預約 / Cancel Booking
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="text-muted small">
                                                                    尚無預約資料
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <a href="/" className="text-decoration-none btn btn-link">← 回首頁 / Back to Home</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
