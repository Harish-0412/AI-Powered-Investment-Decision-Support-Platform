import React from "react";
import Link from "next/link";
import SipCalculator from "../../components/SipCalculator";
import LoadingOverlay from "../../components/LoadingOverlay";

const topFunds = [
  { name: "Aditya Birla Sun Life PSU Equity Fund Direct Payout of IDCW Payout", return3y: "27.71%" },
  { name: "Nippon India Small Cap Fund Direct Plan IDCW Payout", return3y: "21.09%" },
  { name: "SBI Contra Fund", return3y: "20.90%" },
  { name: "Quant Small Cap Fund", return3y: "19.66%" },
  { name: "Bank of India Credit Risk Fund", return3y: "6.33%" },
];

export default function Page() {
  return (
    <main className="section-light mf-page">
      <LoadingOverlay />
      <section className="mf-hero">
        <div className="mf-hero-head">
          <div>
            <p className="section-kicker">SIP Calculator</p>
            <h1>Calculate systematic investment returns with clean charts and fund guidance.</h1>
            <p className="mf-hero-copy">
              Use the SIP estimator to forecast your total value, expected returns, and monthly target contributions.
              Navigate quickly to mutual funds, NFOs, and the fund screener from this page.
            </p>
          </div>
          <div className="mf-hero-links">
            <Link href="/mutual-funds/list" className="mf-pill-link">Mutual funds</Link>
            <Link href="/mutual-funds/nfo" className="mf-pill-link">New Fund Offerings (NFO)</Link>
            <Link href="/mutual-funds/screener" className="mf-pill-link">Mutual Fund Screener</Link>
          </div>
        </div>

        <SipCalculator />
      </section>

      <section className="section-band mf-top-funds">
        <div className="section-inner">
          <div className="section-heading">
            <p className="section-kicker">Start your SIP with Top Performing Funds</p>
            <h2>Funds that have sustained strong returns over the last 3 years</h2>
          </div>

          <div className="mf-table-wrapper">
            <table className="mf-table">
              <thead>
                <tr>
                  <th>Scheme Name</th>
                  <th>3Y return</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {topFunds.map((fund) => (
                  <tr key={fund.name}>
                    <td>{fund.name}</td>
                    <td>{fund.return3y}</td>
                    <td>
                      <Link href="/mutual-funds/list" className="mf-cta-link">
                        Invest Now
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-band mf-info-section">
        <div className="section-inner mf-info-grid">
          <article className="mf-info-card">
            <h2>What is an SIP Calculator?</h2>
            <p>
              The <strong>Systematic Investment Plan Calculator</strong> is a free tool that helps you estimate
              how your SIP investments may grow over time. It takes your regular contribution amount, expected
              rate of return, and investment duration into account to calculate the expected maturity value.
            </p>
            <p>
              A Mutual Fund SIP calculator gives you a quick estimate of future value, expected returns, and the total
              contribution needed to achieve your goals.
            </p>
          </article>

          <article className="mf-info-card">
            <h2>How does SIP Calculator Work?</h2>
            <p>Our SIP calculator online takes three main factors into account:</p>
            <ol>
              <li>Amount of the initial investment (P)</li>
              <li>Frequency of the investment (n)</li>
              <li>Expected rate of return (r)</li>
            </ol>
            <p>
              By using these values, the calculator determines the final invested amount and the estimated returns
              at the end of your chosen period.
            </p>
            <p className="mf-formula">
              A = P × ({"{([1 + r]^n) – 1} / r"}) × (1 + r)
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
