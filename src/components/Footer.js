import "./Footer.css";
import lsmbo from "../assets/lsmbo.png";
import profi from "../assets/profi.png";
import unistra from "../assets/unistra.png";
import cnrs from "../assets/cnrs.png";

export default function Footer() {
    return (
        <div className="footer">
            <div className="footer-logos">
                <img src={lsmbo} alt="lsmbo" />
                <img src={profi} alt="profi" />
                <img src={unistra} alt="unistra" />
                <img src={cnrs} alt="cnrs" />
            </div>
            <div className="footer-info">
                <div>
                    <h3>Contact</h3>
                    <p><a href="mailto:browna@unistra.fr">browna@unistra.fr</a></p>
                </div>
                <div>
                    <h3>GitHub</h3>
                    <p><a href="https://github.com/LSMBO/brownotate-app" target="_blank">https://github.com/LSMBO/brownotate-app</a>&nbsp;(Client)</p>
                    <p><a href="https://github.com/LSMBO/Brownotate" target="_blank">https://github.com/LSMBO/Brownotate</a>&nbsp;(Server)</p>
                </div>
            </div>
        </div>
    );
}


