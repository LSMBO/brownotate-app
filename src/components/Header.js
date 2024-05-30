import logo from "../assets/main_logo_cut.png"
import "./Header.css"

export default function Header() {
    // state

    //comportement

    //affichage
    return (
        <div className="header">
            <div className="title">
                <h1>Brownotate</h1>
                <h4 className="t2_light"><span>B</span>rowse, <span>R</span>etrieve and <span>Annotate</span> any species</h4>
            </div>
            <img src={logo} alt="logo"/>
        </div>
    )
}