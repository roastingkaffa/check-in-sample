
import React, { useEffect, useState } from "react";
import QRCamera from "./QRCamera";
import { toast } from "sonner";

const App = () => {
  const [gps, setGps] = useState(null);
  const [qrGps, setQrGps] = useState(null);
  const [result, setResult] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          toast.error("無法取得 GPS 位置，請確認定位權限已開啟");
        }
      );
    } else {
      toast.error("您的瀏覽器不支援定位功能");
    }
  };

  useEffect(() => {
    if (loggedIn) {
      getLocation();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setResult("");
      setTimestamp("");
      setCountdown(null);
      setQrGps(null);
      setScanning(false);
    }
  }, [countdown]);

  const handleLogin = () => {
    if (userId === "test" && password === "1234") {
      setLoggedIn(true);
    } else {
      toast.error("登入失敗，請檢查帳號密碼");
    }
  };

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleScan = (data) => {
    try {
      const qrData = JSON.parse(data);
      setQrGps({ lat: qrData.lat, lng: qrData.lng });
      toast.success("QR Code 掃描成功！");
    } catch (e) {
      toast.error("掃到無效的 QR Code！");
    }
  };

  const handleCheckIn = () => {
    if (!gps || !qrGps) {
      toast.error("請先取得 GPS 和掃描 QR Code");
      return;
    }
    const distance = getDistance(gps.lat, gps.lng, qrGps.lat, qrGps.lng);
    const now = new Date();
    const timeString = now.toLocaleString();
    if (distance <= 2000) {
      setResult(`✅ 打卡成功，距離 ${distance.toFixed(2)} 公尺`);
    } else {
      setResult(`❌ 打卡失敗，距離 ${distance.toFixed(2)} 公尺超過 2 公里限制`);
    }
    setTimestamp(timeString);
    setCountdown(5);
  };

  if (!loggedIn) {
    return (
      <div className="p-6 font-sans">
        <h2 className="text-2xl font-bold mb-4">使用者登入</h2>
        <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} className="border p-2 mb-2 w-64" />
        <br />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 mb-2 w-64" />
        <br />
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">登入</button>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">GPS 打卡系統</h1>
      {!scanning && !result && (
        <button onClick={() => { setScanning(true); getLocation(); }} className="bg-green-500 text-white px-4 py-2 rounded mb-4">📷 開啟掃描 QR Code</button>
      )}
      {scanning && <QRCamera onScan={handleScan} />}
      {!scanning && qrGps && !result && (
        <button onClick={handleCheckIn} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">✅ 確認打卡</button>
      )}
      <div className="mt-6">
        <p>目前 GPS 座標：{gps ? `${gps.lat}, ${gps.lng}` : "尚未取得"}</p>
        <p>QR Code 座標：{qrGps ? `${qrGps.lat}, ${qrGps.lng}` : "尚未掃描"}</p>
        <p className="font-bold mt-4">{result}</p>
        {timestamp && <p className="mt-2">打卡時間：{timestamp}</p>}
        {countdown !== null && result && <p className="mt-2">{countdown} 秒後返回主畫面...</p>}
      </div>
    </div>
  );
};

export default App;
