// import logo from "../assets/main_logo_cut.png"
import logo from "../assets/main_logo.png"
import "./Header.css"


export default function Header() {

    return (
        <div className="header-container">
            <div className="header">
                <img src={logo} alt="logo"/>
                <div className="title">
                    <h1>Brownotate</h1>
                    <h4 className="t2_light">A comprehensive solution to generate a protein sequence database for any species</h4>
                </div>
            </div>
        </div>
    )
}