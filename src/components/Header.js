import logo from "../assets/main_logo_cut.png"
import "./Header.css"
import DisplayCPUs from './DisplayCPUs';
import { useRuns } from '../contexts/RunsContext'


export default function Header() {
    const { totalCPUs, usedCPUs } = useRuns();

    return (
        <div className="header-container">
            <div className="header">
                <div className="title">
                    <h1>Brownotate</h1>
                    <h4 className="t2_light">A comprehensive solution to generate a protein sequence database for any species</h4>
                </div>
                <img src={logo} alt="logo"/>
            </div>
            <DisplayCPUs totalCPUs={totalCPUs} usedCPUs={usedCPUs} />
        </div>
    )
}