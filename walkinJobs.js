require('dotenv').config(); // load .env file
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

/* ================= EMAIL FUNCTION ================= */
async function sendEmail(subject, body) {
    const sender = "santhosh.mce1234@gmail.com";
    const receiver = "ssantoshkumar97713@gmail.com";

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: sender,
            pass: "xwsssdduwzqjxapc" // Gmail App Password
        }
    });

    await transporter.sendMail({
        from: sender,
        to: receiver,
        subject,
        text: body
    });

    console.log("✅ Email sent successfully");
}

/* ================= SCRAPER ================= */
async function runJobBot() {
    const browser = await puppeteer.launch({
  headless: "new",
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

    const page = await browser.newPage();

    const URL =
        "https://www.naukri.com/software-developer-jobs-in-chennai?k=software%20developer&l=chennai&experience=0&naukriCampus=true";

    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 0 });

    await page.waitForSelector(".srp-jobtuple-wrapper", { timeout: 60000 });

    const jobs = await page.evaluate(() => {
        const wrappers = document.querySelectorAll(".srp-jobtuple-wrapper");
        const data = [];

        wrappers.forEach((wrapper, index) => {
            if (index < 20) {
                const job = wrapper.querySelector(".cust-job-tuple");
                if (!job) return;

                data.push({
                    title: job.querySelector("h2 a.title")?.innerText.trim(),
                    link: job.querySelector("h2 a.title")?.href,

                    company: job.querySelector(".comp-name")?.innerText.trim(),

                    walkInDate: job.querySelector(".walkDateWdth")?.innerText.trim(),

                    salary: job.querySelector(".sal-wrap span")?.getAttribute("title"),

                    location: job.querySelector(".loc-wrap span")?.getAttribute("title"),

                    description: job.querySelector(".job-desc")?.innerText.trim(),

                    posted: job.querySelector(".job-post-day")?.innerText.trim(),

                    isWalkIn: job.querySelector(".ttc__walk-in") ? "YES" : "NO"
                });
            }
        });

        return data;
    });

    console.log("\n✅ SCRAPED JOB:\n", jobs);

    const validPosted = (postedText = "") => {
        const text = postedText.toLowerCase();
        return (
            text.includes("just now") ||
            text.includes("few hours") ||
            text.includes("hour ago") ||
            text.includes("hours ago") ||
            text.includes("1 day ago")
        );
    };

    const recentJobs = jobs.filter(job => validPosted(job.posted));

    if (recentJobs.length > 0) {
        let mailBody = `🔥 RECENT JOB ALERTS – SOFTWARE / PYTHON (CHENNAI)\n\n`;

        recentJobs.forEach((job, index) => {
            mailBody += `
${index + 1}. ${job.title}
Company: ${job.company}
Location: ${job.location}
Salary: ${job.salary || "Not mentioned"}
Posted: ${job.posted}
Walk-in: ${job.isWalkIn}
Apply: ${job.link}

----------------------------------------
`;
        });

        await sendEmail(
            "🚀 Fresh Job Alerts – Just Now / Few Hours Ago",
            mailBody
        );
    } else {
        console.log("❌ No recent jobs found");
    }


    await browser.close();

};

module.exports = runJobBot;
