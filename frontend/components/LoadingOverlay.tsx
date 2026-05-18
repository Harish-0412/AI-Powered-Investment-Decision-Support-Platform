"use client";
import React, { useEffect, useState } from "react";

export default function LoadingOverlay({ delay = 700 }: { delay?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onLoad = () => setVisible(false);
    // hide after delay to ensure a brief visible loader even when fast
    const t = setTimeout(() => setVisible(false), delay);
    // also listen for full window load
    window.addEventListener("load", onLoad);
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", onLoad);
    };
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="mf-loader-overlay" aria-hidden>
      <style>{`
        /* Loader styles (embedded) */
        .mf-loader-overlay { position: fixed; inset: 0; display: grid; place-items: center; background: rgba(17,24,22,0.6); z-index: 9999; }
        .loader { position: absolute; top: 50%; left: 50%; margin-left: -50px; animation: speeder 0.4s linear infinite; }
        .loader > span { height: 5px; width: 35px; background: #f51313; position: absolute; top: -19px; left: 60px; border-radius: 2px 10px 1px 0; }
        .base span { position: absolute; width: 0; height: 0; border-top: 6px solid transparent; border-right: 100px solid #f3cfcf; border-bottom: 6px solid transparent; }
        .base span:before { content: ""; height: 22px; width: 22px; border-radius: 50%; background: #f3cfcf; position: absolute; right: -110px; top: -16px; }
        .base span:after { content: ""; position: absolute; width: 0; height: 0; border-top: 0 solid transparent; border-right: 55px solid #f3cfcf; border-bottom: 16px solid transparent; top: -16px; right: -98px; }
        .face { position: absolute; height: 12px; width: 20px; background: #f3cfcf; border-radius: 20px 20px 0 0; transform: rotate(-40deg); right: -125px; top: -15px; }
        .face:after { content: ""; height: 12px; width: 12px; background: #f51313; right: 4px; top: 7px; position: absolute; transform: rotate(40deg); transform-origin: 50% 50%; border-radius: 0 0 2px 2px; }
        .loader > span > span { width: 30px; height: 1px; background: #ffffff; position: absolute; }
        .loader > span > span:nth-child(1) { animation: fazer1 0.2s linear infinite; }
        .loader > span > span:nth-child(2) { top: 3px; animation: fazer2 0.4s linear infinite; }
        .loader > span > span:nth-child(3) { top: 1px; animation: fazer3 0.4s linear infinite; animation-delay: -1s; }
        .loader > span > span:nth-child(4) { top: 4px; animation: fazer4 1s linear infinite; animation-delay: -1s; }
        @keyframes fazer1 { 0% { left: 0; } 100% { left: -80px; opacity: 0; } }
        @keyframes fazer2 { 0% { left: 0; } 100% { left: -100px; opacity: 0; } }
        @keyframes fazer3 { 0% { left: 0; } 100% { left: -50px; opacity: 0; } }
        @keyframes fazer4 { 0% { left: 0; } 100% { left: -150px; opacity: 0; } }
        @keyframes speeder { 0% { transform: translate(2px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -3px) rotate(-1deg); } 20% { transform: translate(-2px, 0px) rotate(1deg); } 30% { transform: translate(1px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 3px) rotate(-1deg); } 60% { transform: translate(-1px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-2px, -1px) rotate(1deg); } 90% { transform: translate(2px, 1px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
        .longfazers { position: absolute; width: 100%; height: 100%; }
        .longfazers span { position: absolute; height: 2px; width: 20%; background: #ffffff; }
        .longfazers span:nth-child(1) { top: 20%; animation: lf 0.6s linear infinite; animation-delay: -5s; }
        .longfazers span:nth-child(2) { top: 40%; animation: lf2 0.8s linear infinite; animation-delay: -1s; }
        .longfazers span:nth-child(3) { top: 60%; animation: lf3 0.6s linear infinite; }
        .longfazers span:nth-child(4) { top: 80%; animation: lf4 0.5s linear infinite; animation-delay: -3s; }
        @keyframes lf { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
        @keyframes lf2 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
        @keyframes lf3 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }
        @keyframes lf4 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }
        .clouds { position: absolute; width: 100%; height: 100%; z-index: -1; overflow: hidden; }
        .cloud { position: absolute; background: #fff; border-radius: 50%; opacity: 0.25; animation: moveClouds linear infinite; }
        .cloud::before, .cloud::after { content: ""; position: absolute; background: #fff; border-radius: 50%; }
        .cloud::before { width: 60%; height: 60%; top: -30%; left: 10%; }
        .cloud::after { width: 40%; height: 40%; top: -20%; left: 50%; }
        .cloud1 { width: 100px; height: 60px; top: 15%; left: 1400px; animation-duration: 2s; }
        .cloud2 { width: 150px; height: 80px; top: 35%; left: 1600px; animation-duration: 3s; }
        .cloud3 { width: 80px; height: 50px; top: 20%; left: 2000px; animation-duration: 4s; }
        .cloud4 { width: 100px; height: 80px; top: 70%; left: 1100px; animation-duration: 3s; }
        .cloud5 { width: 170px; height: 50px; top: 80%; left: 1500px; animation-duration: 2s; }
        @keyframes moveClouds { 0% { transform: translateX(0); } 100% { transform: translateX(-2000px); } }
      `}</style>
      <div className="clouds">
        <div className="cloud cloud1" />
        <div className="cloud cloud2" />
        <div className="cloud cloud3" />
        <div className="cloud cloud4" />
        <div className="cloud cloud5" />
      </div>

      <div className="loader">
        <span>
          <span />
          <span />
          <span />
          <span />
        </span>
        <div className="base">
          <span />
          <div className="face" />
        </div>
      </div>

      <div className="longfazers">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
