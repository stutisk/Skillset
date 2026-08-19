import { useEffect, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

const BASE_URL = "https://syncsphere-hiv6.onrender.com"

export default function CourseSection(props) {
    const { accentColor, sectionTitle } = props

    const [courses, setCourses] = useState([])
    const [country, setCountry] = useState("US")
    const [countryFailed, setCountryFailed] = useState(false)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        setLoading(true)
        setError(false)
        setCountryFailed(false)

        fetch(BASE_URL + "/assignment/course-data")
            .then((res) => {
                if (!res.ok) throw new Error("courses request failed")
                return res.json()
            })
            .then((data) => setCourses(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false))

        fetch(BASE_URL + "/assignment/country-code")
            .then((res) => {
                if (!res.ok) throw new Error("country request failed")
                return res.json()
            })
            .then((data) => setCountry(data.country_code))
            .catch(() => {
                setCountry("US")
                setCountryFailed(true)
            })
    }, [retryCount])

    function formatPrice(course) {
        if (country === "IN" && typeof course.pricePaise === "number") {
            const rupees = course.pricePaise / 100
            return "₹" + rupees.toLocaleString("en-IN")
        }

        if (typeof course.priceUsdCents === "number") {
            const dollars = course.priceUsdCents / 100
            return "$" + dollars.toFixed(2)
        }

        return "Price unavailable"
    }

    if (loading) {
        return (
            <section style={sectionStyle}>
                <div style={headerStyle}>
                    <h2 style={headingStyle}>{sectionTitle}</h2>
                </div>

                <div className="course-grid">
                    {[1, 2, 3].map((item) => (
                        <div key={item} style={cardStyle}>
                            <div className="skeleton skeleton-title" />
                            <div className="skeleton skeleton-badge" />
                            <div className="skeleton skeleton-text" />
                            <div className="skeleton skeleton-text short" />
                            <div className="skeleton skeleton-price" />
                        </div>
                    ))}
                </div>

                <style>{`
                .course-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }

                .skeleton {
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 6px;
                    animation: pulse 1.5s ease-in-out infinite;
                }

                .skeleton-title {
                    width: 70%;
                    height: 20px;
                    margin-bottom: 8px;
                }

                .skeleton-badge {
                    width: 80px;
                    height: 18px;
                }

                .skeleton-text {
                    width: 100%;
                    height: 12px;
                    margin-top: 8px;
                }

                .skeleton-text.short {
                    width: 65%;
                }

                .skeleton-price {
                    width: 60px;
                    height: 20px;
                    margin-top: 12px;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.5;
                    }
                    50% {
                        opacity: 1;
                    }
                }

                @media (max-width: 900px) {
                    .course-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 600px) {
                    .course-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
            </section>
        )
    }

    if (error) {
        return (
            <section style={centerStyle}>
                <h2 style={headingStyle}>{sectionTitle}</h2>
                <p style={mutedTextStyle}>Couldn't load courses. Try again.</p>
                <button
                    onClick={() => setRetryCount(retryCount + 1)}
                    style={{ ...buttonStyle, background: accentColor }}
                >
                    Retry
                </button>
            </section>
        )
    }

    if (courses.length === 0) {
        return (
            <section style={centerStyle}>
                <h2 style={headingStyle}>{sectionTitle}</h2>
                <p style={mutedTextStyle}>No courses available right now.</p>
            </section>
        )
    }

    return (
        <section style={sectionStyle}>
            <div style={headerStyle}>
                <h2 style={headingStyle}>{sectionTitle}</h2>
                {countryFailed && (
                    <span style={noticeStyle}>
                        Couldn't detect your country. Showing USD prices.
                    </span>
                )}
            </div>

            <div className="course-grid">
                {courses.map((course, index) => (
                    <div
                        key={course.courseCode || index}
                        className="course-card"
                        style={cardStyle}
                    >
                        <h3 style={cardTitleStyle}>{course.courseName}</h3>

                        {course.refundable && (
                            <span
                                style={{
                                    ...badgeStyle,
                                    color: accentColor,
                                    borderColor: accentColor,
                                }}
                            >
                                Refundable
                            </span>
                        )}

                        <p style={descriptionStyle}>{course.description}</p>

                        <strong style={{ color: accentColor, fontSize: 18 }}>
                            {formatPrice(course)}
                        </strong>
                    </div>
                ))}
            </div>

            <style>{`
                .course-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }
                @media (max-width: 900px) {
                    .course-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 600px) {
                    .course-grid { grid-template-columns: 1fr; }
                }
                .course-card {
                    transition: border-color 0.15s ease, transform 0.15s ease;
                }
                .course-card:hover {
                    border-color: rgba(255, 255, 255, 0.28);
                    transform: translateY(-2px);
                }
            `}</style>
        </section>
    )
}

const sectionStyle = { width: "100%", background: "transparent" }

const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
}

const headingStyle = {
    margin: 0,
    fontSize: 28,
    color: "#F5F5F7",
}

const mutedTextStyle = {
    color: "#FFFFFF",
    fontSize: 14,
}

const centerStyle = {
    textAlign: "center",
    padding: 40,
    color: "#FFFFFF",
}

const cardStyle = {
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: 14,
    padding: 22,
    background: "rgba(255, 255, 255, 0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
}

const cardTitleStyle = {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    color: "#F5F5F7",
}

const descriptionStyle = {
    fontSize: 14,
    color: "rgba(245, 245, 247, 0.6)",
    marginTop: 4,
    marginBottom: 10,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
}

const badgeStyle = {
    display: "inline-block",
    width: "fit-content",
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid",
    borderRadius: 999,
    padding: "2px 8px",
    marginTop: 2,
}

const buttonStyle = {
    border: "none",
    color: "#fff",
    padding: "10px 22px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
}

const noticeStyle = {
    fontSize: 13,
    color: "rgba(245, 245, 247, 0.5)",
}

addPropertyControls(CourseSection, {
    sectionTitle: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "Explore courses",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#5A45FF",
    },
})
