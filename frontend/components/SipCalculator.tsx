"use client";
import React, { useMemo, useState } from "react";

function formatINR(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default function SipCalculator() {
  const [calculatorType, setCalculatorType] = useState<"sip" | "lumpsum" | "advance">("sip");
  const [monthly, setMonthly] = useState<number>(5000);
  const [lumpSum, setLumpSum] = useState<number>(300000);
  const [target, setTarget] = useState<number>(500000);
  const [annualRate, setAnnualRate] = useState<number>(12);
  const [years, setYears] = useState<number>(5);

  const monthlyRate = useMemo(() => annualRate / 100 / 12, [annualRate]);
  const periods = useMemo(() => Math.max(1, Math.round(years * 12)), [years]);

  const results = useMemo(() => {
    if (calculatorType === "sip") {
      const r = monthlyRate;
      const n = periods;
      if (r === 0) {
        const invested = monthly * n;
        return { finalAmount: invested, invested, returns: 0 };
      }
      const factor = (Math.pow(1 + r, n) - 1) / r;
      const finalAmount = monthly * factor * (1 + r);
      const invested = monthly * n;
      return { finalAmount, invested, returns: finalAmount - invested };
    }

    if (calculatorType === "lumpsum") {
      const invested = lumpSum;
      const finalAmount = invested * Math.pow(1 + annualRate / 100, years);
      return { finalAmount, invested, returns: finalAmount - invested };
    }

    const r = monthlyRate;
    const n = periods;
    if (r === 0) {
      const monthlyRequired = target / n;
      return { monthlyRequired, invested: target, finalAmount: target, returns: 0 };
    }
    const factor = (Math.pow(1 + r, n) - 1) / r;
    const monthlyRequired = target / (factor * (1 + r));
    const invested = monthlyRequired * n;
    return { monthlyRequired, invested, finalAmount: target, returns: target - invested };
  }, [calculatorType, monthly, lumpSum, target, monthlyRate, years, periods, annualRate]);

  const completionPercent = useMemo(() => {
    const total = calculatorType === "advance" ? results.invested ?? 0 : results.finalAmount ?? 0;
    if (!total || calculatorType === "advance") return 100;
    return Math.min(100, ((results.invested ?? 0) / total) * 100);
  }, [calculatorType, results.finalAmount, results.invested]);

  const chartDash = `${completionPercent} ${100 - completionPercent}`;

  const displaySummary = useMemo(() => {
    if (calculatorType === "sip") {
      return {
        title: "The total value of your investment after",
        value: results.finalAmount ?? 0,
        labelA: "Invested Amount",
        valueA: results.invested ?? 0,
        labelB: "Est. Returns",
        valueB: results.returns ?? 0,
      };
    }

    if (calculatorType === "lumpsum") {
      return {
        title: "The maturity value of your lumpsum investment after",
        value: results.finalAmount ?? 0,
        labelA: "Invested Amount",
        valueA: results.invested ?? 0,
        labelB: "Est. Returns",
        valueB: results.returns ?? 0,
      };
    }

    return {
      title: "Monthly SIP required to reach your target in",
      value: results.monthlyRequired ?? 0,
      labelA: "Target Amount",
      valueA: results.finalAmount ?? 0,
      labelB: "Total Invested",
      valueB: results.invested ?? 0,
    };
  }, [calculatorType, results.finalAmount, results.invested, results.monthlyRequired, results.returns]);

  return (
    <section className="mf-calculator">
      <div className="mf-card">
        <div className="mf-card-header">
          <div>
            <p className="section-kicker">Returns Estimator</p>
            <h2>Estimate your SIP outcomes instantly</h2>
            <p className="mf-card-subtitle">
              Enter your expected SIP amount, duration, and returns to preview your final value and estimated earnings.
            </p>
          </div>
          <div className="mf-tabs">
            <button
              type="button"
              className={calculatorType === "sip" ? "mf-tab active" : "mf-tab"}
              onClick={() => setCalculatorType("sip")}
            >
              SIP Investment Amount
            </button>
            <button
              type="button"
              className={calculatorType === "lumpsum" ? "mf-tab active" : "mf-tab"}
              onClick={() => setCalculatorType("lumpsum")}
            >
              Lumpsum Amount
            </button>
            <button
              type="button"
              className={calculatorType === "advance" ? "mf-tab active" : "mf-tab"}
              onClick={() => setCalculatorType("advance")}
            >
              Advance SIP Calculator
            </button>
          </div>
        </div>

        <div className="mf-calculator-grid">
          <div className="mf-panel mf-panel-inputs">
            {calculatorType === "sip" && (
              <>
                <label className="mf-label">ENTER AMOUNT</label>
                <div className="mf-value-box">{formatINR(monthly)}</div>
                <input
                  type="range"
                  min={500}
                  max={25000}
                  step={500}
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  className="mf-slider"
                />
              </>
            )}

            {calculatorType === "lumpsum" && (
              <>
                <label className="mf-label">ENTER LUMPSUM</label>
                <div className="mf-value-box">{formatINR(lumpSum)}</div>
                <input
                  type="range"
                  min={50000}
                  max={2000000}
                  step={50000}
                  value={lumpSum}
                  onChange={(e) => setLumpSum(Number(e.target.value))}
                  className="mf-slider"
                />
              </>
            )}

            {calculatorType === "advance" && (
              <>
                <label className="mf-label">TARGET AMOUNT</label>
                <div className="mf-value-box">{formatINR(target)}</div>
                <input
                  type="range"
                  min={100000}
                  max={2000000}
                  step={50000}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="mf-slider"
                />
              </>
            )}

            <div className="mf-range-row">
              <div>
                <p className="mf-range-title">Select Duration</p>
                <strong>{years} Yrs</strong>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="mf-slider"
              />
            </div>

            <div className="mf-range-row">
              <div>
                <p className="mf-range-title">Expected Rate of Return</p>
                <strong>{annualRate}%</strong>
              </div>
              <input
                type="range"
                min={8}
                max={30}
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="mf-slider"
              />
            </div>
          </div>

          <div className="mf-panel mf-panel-summary">
            <div className="mf-summary-head">
              <span>{displaySummary.title}</span>
              <strong>{years} Years</strong>
            </div>
            <div className="mf-summary-total">{formatINR(displaySummary.value)}</div>
            <div className="mf-chart-ring" aria-hidden="true">
              <svg viewBox="0 0 120 120" className="mf-donut">
                <circle cx="60" cy="60" r="48" className="mf-donut-bg" />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className="mf-donut-fill"
                  strokeDasharray={chartDash}
                  strokeDashoffset="25"
                />
              </svg>
              <span className="mf-donut-label">{Math.round(completionPercent)}% invested</span>
            </div>

            <div className="mf-summary-metrics">
              <div>
                <span>{displaySummary.labelA}</span>
                <strong>{formatINR(displaySummary.valueA)}</strong>
              </div>
              <div>
                <span>{displaySummary.labelB}</span>
                <strong>{formatINR(displaySummary.valueB)}</strong>
              </div>
            </div>
            <button type="button" className="mf-action">Invest Now</button>
          </div>
        </div>
      </div>
    </section>
  );
}
