import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './About.css';

const screenshotsContext = require.context('../assets/documentation_screenshots', false, /\.png$/);
const screenshots = screenshotsContext.keys().reduce((acc, key) => {
    acc[key.replace('./', '').replace('.png', '')] = screenshotsContext(key);
    return acc;
}, {});

function DocShot({ imageKey, title, children }) {
    const src = screenshots[imageKey];
    if (!src) {
        return null;
    }

    return (
        <figure className="doc-shot">
            <img src={src} alt={title} className="doc-shot-image" loading="lazy" />
            <figcaption className="doc-shot-caption">
                <strong>{title}</strong>
                <div className="doc-shot-copy">{children}</div>
            </figcaption>
        </figure>
    );
}

export default function About() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activePage, setActivePage] = useState('access-navigation');

    const pages = useMemo(() => ([
        { id: 'access-navigation', label: 'Access & Navigation' },
        { id: 'database-search', label: 'Database Search' },
        { id: 'previous-searches', label: 'Previous Searches' },
        { id: 'create-annotation', label: 'Create Annotation' },
        { id: 'my-annotations', label: 'My Annotations & Results' },
        { id: 'brownaming', label: 'Brownaming' },
    ]), []);

    const handleBack = () => {
        const from = location.state?.from || '/';
        navigate(from);
    };

    const renderPage = () => {
        if (activePage === 'access-navigation') {
            return (
                <>
                    <h2>Access & Navigation</h2>
                    <p className="doc-lead">
                        This page documents how to use the Brownotate interface. For the scientific background, the pipeline logic,
                        and the broader methodological context, refer to the publication below.
                    </p>
                    <blockquote className="doc-citation">
                        <strong>Brownotate: A Comprehensive Solution to Generate Protein Sequence Databases for Any Species</strong>
                        <br />
                        Adrien Brown, Alexandre Burel, Sarah Cianferani, Christine Carapito, Fabrice Bertile
                        <br />
                        <em>Proteomics</em>, First published: 06 January 2026
                        <br />
                        <a href="https://analyticalsciencejournals.onlinelibrary.wiley.com/doi/10.1002/pmic.70094" target="_blank" rel="noopener noreferrer">
                            https://doi.org/10.1002/pmic.70094
                        </a>
                    </blockquote>

                    <h3>Login and Account Access</h3>
                    <DocShot imageKey="Image35" title="Login URL">
                        The public entry point is the login page at <code>/login</code>. This is the page shown to both guest users
                        and registered users.
                    </DocShot>
                    <DocShot imageKey="Image31" title="Login Page Overview">
                        Existing users can sign in from the left panel. Users without an account can still enter
                        <strong> Guest Mode</strong> to run database searches, but guest users cannot launch annotations.
                        Account creation relies on an internal access code that we share within the lab in our
                        <strong> Public Zone</strong>. If the code cannot be found, or for any external user who needs an account,
                        please contact Fabrice Bertile at <a href="mailto:fbertile@unistra.fr">fbertile@unistra.fr</a> to retrieve it.
                    </DocShot>
                    <DocShot imageKey="Image32" title="Create Account After Access Code Validation">
                        After the access code is accepted, Brownotate opens the email and password form. Passwords must contain at least
                        4 characters. Once the account is created, the new user can immediately sign in from the standard Sign In form.
                    </DocShot>
                    <DocShot imageKey="Image33" title="Existing Email Popup During Account Creation">
                        If the entered email is already present in the database, Brownotate does not create a duplicate account. Instead,
                        it opens a confirmation popup proposing to update the password of the existing user.
                    </DocShot>
                    <DocShot imageKey="Image34" title="Forgot Password Popup">
                        The <strong>Forgot Password</strong> popup allows a registered user to set a new password directly by providing an
                        email address and a replacement password.
                    </DocShot>

                    <h3>Navigation Between Pages</h3>
                    <DocShot imageKey="Image36" title="Home / Database Search Header">
                        After login, Brownotate opens on the home page at <code>/</code>. The top header provides direct access to
                        <strong> My Annotations</strong>, <strong>Create Annotation</strong>, <strong>Logout</strong>, and
                        <strong> About</strong>.
                    </DocShot>
                    <DocShot imageKey="Image37" title="About Page Header">
                        The About page includes a back button that returns to the page from which the documentation was opened.
                    </DocShot>
                    <DocShot imageKey="Image38" title="My Annotations Header">
                        The My Annotations page is available at <code>/my-annotations</code> and includes a <strong>Back Home</strong>
                        button. Clicking <strong>Parameters</strong> or <strong>Results</strong> on a run card opens the detailed run view.
                    </DocShot>
                    <DocShot imageKey="Image39" title="Single Run View Header">
                        The detailed run page lives at <code>/my-annotations/&lt;run_id&gt;</code>. The <strong>My Annotations</strong>
                        button returns from that detailed run page back to the list of runs.
                    </DocShot>
                    <DocShot imageKey="Image40" title="Create Annotation Header">
                        The Create Annotation page includes navigation shortcuts back to <strong>Home</strong> and directly to the
                        standalone <strong>Brownaming</strong> page.
                    </DocShot>
                    <DocShot imageKey="Image41" title="Brownaming Header">
                        The standalone Brownaming page includes a direct navigation button back to <strong>My Annotations</strong> so the
                        user can monitor launched runs.
                    </DocShot>
                </>
            );
        }

        if (activePage === 'database-search') {
            return (
                <>
                    <h2>Database Search</h2>

                    <h3>Launching a New Search</h3>
                    <DocShot imageKey="Image9" title="New Database Search - Default View">
                        This is the default home view after login. Start by entering either a scientific species name or a taxID in
                        the species field, for example <em>Amphiprion ocellaris</em>. Before launching the search, you can adjust the
                        database-search options, including those related to sequencing data retrieval.
                        Once everything is configured, click <strong>Search</strong> to run the query. The
                        <strong> How does it work?</strong> button provides detailed explanations about the available options and the
                        underlying search process.
                    </DocShot>
                    <DocShot imageKey="Image10" title="RNA Sequencing Search Options">
                        RNA sequencing options are configured separately from DNA sequencing options. This screenshot shows the default RNA
                        search form. The detailed meaning of each option is documented in the <strong>How does it work?</strong> button.
                    </DocShot>

                    <h3>Watching the Search in Real Time</h3>
                    <DocShot imageKey="Image11" title="Database Search In Progress">
                        While the search is running, Brownotate displays the current step, such as <strong>NCBI GenBank</strong>, together
                        with a min/max waiting-time estimate. The <strong>Cancel</strong> button can stop the process at any time. Results
                        appear progressively while the search is still running. The source names such as <strong>UniProt</strong>,
                        <strong> RefSeq</strong>, <strong>Ensembl</strong>, and <strong>GenBank</strong> are interactive toggles used to
                        show or hide the datasets found in each database. Dataset names can also be clicked to open the original source
                        website.
                    </DocShot>

                    <h3>Working with Result Tabs</h3>
                    <DocShot imageKey="Image12" title="Protein Results and Protein Download">
                        Protein datasets can be selected and downloaded directly. In this example, UniProt and Ensembl are active, several
                        protein sources are selected, and a merged protein file has already been downloaded.
                    </DocShot>
                    <DocShot imageKey="Image13" title="Assemblies Tab and Create Annotation">
                        Assembly accessions are clickable in the <strong>Description</strong> column and open the corresponding NCBI or
                        Ensembl page in a new browser tab. Once an assembly is selected, <strong>Create an annotation</strong> opens the
                        annotation form with this assembly already prefilled.
                    </DocShot>
                    <DocShot imageKey="Image14" title="DNA Sequencing Tab">
                        DNA sequencing results are grouped into optimized batches. In this example, one batch containing one run is
                        selected. SRA accessions are clickable, and the button
                        <strong> Create an annotation using the selected dataset</strong> opens Create Annotation with the chosen DNA
                        dataset already filled in.
                    </DocShot>
                    <DocShot imageKey="Image15" title="RNA Sequencing Tab - First View">
                        The RNA sequencing tab follows the same overall logic as the DNA sequencing.
                    </DocShot>
                    <DocShot imageKey="Image16" title="RNA Sequencing Selection, Tissue Column, and Phylogeny Button">
                        Multiple RNA sequencing datasets can be selected at once. It is generally recommended to combine RNA sequencing datasets from different tissues when possible. The
                        annotation button uses the selected RNA datasets as direct inputs.Datasets from Illumina, BGISEQ, or IonTorrent (short-read) cannot be combined with PacBio or Oxford Nanopore (long-read) datasets.
                        At the bottom, <strong>Generate Phylogeny Map</strong> opens the phylogeny view documented below.
                    </DocShot>

                    <h3>Phylogeny Tree</h3>
                    <DocShot imageKey="Image17" title="Phylogeny Tree Overview">
                        The dedicated <strong>Phylogeny Tree</strong> tab shows how the returned datasets are distributed across the taxonomy.
                        The tree is read from right to left, with <em>cellular organisms</em> on the far right and the searched species on
                        the left. All circles can be hovered, and the blue circles are clickable. The checkboxes determine which databases
                        contribute to the displayed counts.
                    </DocShot>
                    <DocShot imageKey="Image18" title="Clickable Clade Popup in the Phylogeny Tree">
                        Clicking a blue count opens a popup listing the datasets that contribute to that clade. In this example, the popup
                        contains GenBank annotations generated for species belonging to the Ovalentaria clade.
                    </DocShot>
                </>
            );
        }

        if (activePage === 'previous-searches') {
            return (
                <>
                    <h2>Load Previous Search</h2>
                    <DocShot imageKey="Image19" title="Load Previous Search - Initial State">
                        <strong>Load Previous Search</strong> is used to recover earlier database searches. Begin typing a species name or
                        taxID to retrieve stored organisms. Before a species is selected, each collection remains empty and displays
                        <strong> No data found</strong>.
                    </DocShot>
                    <DocShot imageKey="Image20" title="Historical Searches Listed by Collection and Date">
                        Once a species is selected, Brownotate lists all stored searches grouped by collection. Entries are sorted by date,
                        and each row displays the options that were used when that database search was run. This is useful when two previous
                        searches used different sequencing platforms or different filters.
                    </DocShot>
                    <DocShot imageKey="Image21" title="Results Rebuilt from Selected Historical Entries">
                        The blue selections in the collection list determine which stored entries are displayed in the result tabs below.
                        The results behave exactly like a fresh database search: proteins can be downloaded, and selected
                        assemblies or sequencing datasets can still be forwarded to Create Annotation.
                    </DocShot>
                </>
            );
        }

        if (activePage === 'create-annotation') {
            return (
                <>
                    <h2>Create Annotation</h2>

                    <h3>Choosing the Input Data</h3>
                    <DocShot imageKey="Image22" title="Create Annotation - Blank Form in DNA Mode">
                        Create Annotation starts with a species field and a start-data section. Enter a species name or taxID, then choose
                        the input type: DNA sequencing, RNA sequencing, or assembly. For sequencing input, Brownotate accepts SRA accessions
                        such as <code>SRR36291233</code>, or custom uploaded files with an explicit platform. The platform matters because it
                        influences the assembly strategy selected later. If the page was opened from Database Search, the selected datasets are
                        already prefilled.
                    </DocShot>
                    <DocShot imageKey="Image23" title="Species Confirmation and Added DNA Run">
                        After clicking <strong>Confirm</strong> for the species and <strong>Add</strong> for the accession, Brownotate locks in
                        the species and displays the selected DNA run in the start-data section.
                    </DocShot>
                    <DocShot imageKey="Image24" title="Assembly Mode and Protein Prediction Settings">
                        In assembly mode, the user can upload a custom assembly file directly. If the page was reached from Database Search with
                        a selected assembly, that assembly appears here automatically. Further down, the protein-prediction section contains
                        options such as minimum sequence length and duplicate-sequence removal. Tooltips throughout the page provide more detail.
                    </DocShot>
                    <DocShot imageKey="Image25" title="RNA Sequencing Mode and Transcript Assembly">
                        RNA mode supports both SRA accessions and custom files, just like DNA mode. If RNA datasets were selected during database
                        search, they are already present here. The <strong>Transcript Assembly</strong> section lets the user select the assembler:
                        <strong> Trinity</strong> is limited to short reads and is slower but generally stronger on short-read transcript assembly,
                        while <strong>RNA-Bloom</strong> supports both short and long reads and is therefore used when long-read RNA datasets are
                        supplied.
                    </DocShot>

                    <h3>Advanced Sections</h3>
                    <DocShot imageKey="Image26" title="Augustus Parameters and Brownaming Section">
                        The <strong>Augustus</strong> section appears only for eukaryotic annotations because prokaryotic annotations use Prokka.
                        The evidence proteins are proteins from related species that help locate genes on the target genome and train the Augustus
                        model. Leaving evidence selection in <strong>automatic</strong> mode is recommended: Brownotate first keeps direct UniProt
                        target-species proteins when available, then prefers direct target-species annotation datasets, and if none exist it uses up 
                        to four annotation datasets from related organisms. The Brownaming section uses the same options as the standalone Brownaming page; 
                        the interpretation of Brownaming results is explained in section 'My Annotations & Results'.
                    </DocShot>
                    <DocShot imageKey="Image27" title="BUSCO Section, Run Button, and Debugging Information">
                        BUSCO on the assembly is not available in RNA mode, while BUSCO on the annotation remains available. The
                        <strong> Run Brownotate</strong> button launches the run and redirects to <strong>My Annotations</strong>. The
                        <strong> Debugging Information</strong> block is useful when checking that the form has been converted into the expected
                        internal parameters. In Guest Mode, launching annotations is disabled because only account holders can submit runs.
                    </DocShot>
                    <DocShot imageKey="Image28" title="DNA Short-Read Assembly Method Options">
                        <strong>Run fastp</strong> and <strong>Run Bowtie2</strong> are available only for DNA short-read sequencing workflows.
                        They do not appear for long-read DNA input.
                    </DocShot>
                </>
            );
        }

        if (activePage === 'my-annotations') {
            return (
                <>
                    <h2>My Annotations & Results</h2>

                    <h3>Monitoring Runs</h3>
                    <DocShot imageKey="Image1" title="Running Annotation Card">
                        The progress bar is read from left to right. Completed steps are blue, the currently running step is yellow. Each step has its 
                        own waiting‑time estimate, which is continuously updated as more Brownotate runs finish and provide new timing data.
                        The <strong>Parameters</strong> and <strong>Results</strong> buttons can be clicked to open the corresponding views for the run.
                        <strong>Refresh</strong> re-queries the database to update the run status, while the delete button in the corner
                        removes the run completely.
                    </DocShot>
                    <DocShot imageKey="Image2" title="Completed Annotation Card">
                        This is what the same element looks like once the process has completed successfully.
                    </DocShot>
                    <DocShot imageKey="Image30" title="Brownaming Tag in My Annotations">
                        Standalone Brownaming runs are visually identified in My Annotations with a violet <strong>Brownaming</strong> label.
                    </DocShot>

                    <h3>Reading the Results Tab</h3>
                    <DocShot imageKey="Image3" title="Results Tab - BUSCO Overview">
                        This page is opened by clicking <strong>Results</strong> from the My Annotations card.
                        BUSCO is a completeness metric: its summaries help interpret how complete the assembly and the predicted annotation are in
                        simple terms.
                    </DocShot>
                    <DocShot imageKey="Image4" title="Brownaming Result Table and Graph">
                        Further down the Results page, Brownotate shows the Brownaming outputs. The graph can be read as a cumulative naming
                        process across increasing taxonomic levels. In this example, Brownaming first compares predicted proteins against all
                        entries from the exact target species, here <em>Pseudomonas aeruginosa</em> with 2,683 reference proteins (x = 1 in the
                        plot). At this first step, 2,618 predicted proteins receive a satisfactory match and a propagated name, which corresponds
                        to about 41% of all input proteins. Brownotate then moves to the next taxonomic level, <em>Pseudomonas aeruginosa group</em>.
                        This level contains 515 additional proteins beyond the 2,683 already tested, and Brownotate avoids reusing entries
                        from the previous step. After this second comparison, the total number of named proteins becomes 2,623, meaning only 5 new
                        proteins were named at this level. Brownotate then expands to the genus <em>Pseudomonas</em> outside the
                        <em>Pseudomonas aeruginosa group</em>  (6,737 additional proteins in this example), and the named proportion rises from
                        about 41% to about 45%. The same logic is repeated level by level until the configured taxonomic expansion limit is reached.
                    </DocShot>
                    <DocShot imageKey="Image5" title="Step Runtime Summary">
                        <strong>Step Runtime Summary</strong> lists how long each processing stage took. This is especially useful when a run is slow,
                        or when comparing the cost of assembly, annotation, BUSCO, and Brownaming across runs.
                    </DocShot>

                    <h3>Parameters Tab</h3>
                    <DocShot imageKey="Image6" title="Parameters Tab">
                        The Parameters tab is reachable either directly from My Annotations or by switching from the Results tab once the run page is
                        open. It contains the exact values that were used before the annotation started.
                    </DocShot>
                    <DocShot imageKey="Image8" title="parameters.txt File">
                        The <code>parameters.txt</code> file is the human-readable export of the run configuration. In addition to the selected inputs
                        and parameters, it also stores version information for the tools involved in the run.
                    </DocShot>

                    <h3>Downloads and ZIP Structure</h3>
                    <DocShot imageKey="Image3" title="Results Tab - Download Buttons">
                        The same Results page also includes four download buttons:
                        <ul>
                            <li><strong>All (zipped)</strong>: full archive.</li>
                            <li><strong>Assembly</strong>: genome assembly.</li>
                            <li><strong>Annotation</strong>: predicted proteins.</li>
                            <li><strong>Brownaming (zipped)</strong>: naming outputs.</li>
                        </ul>
                    </DocShot>
                    <DocShot imageKey="Image7" title="Structure of the Downloaded ZIP Archive">
                        This is typically what is obtained with the <strong>All (zipped)</strong> button.
                        This example archive comes from a prokaryotic assembly-annotation run. It contains directories such as <code>seq/</code>,
                        <code> annotation/</code>, <code>brownaming/</code>, <code>genome/</code>, and <code>stats/</code>, together with files like
                        <code> busco_annotation.json</code>, <code>busco_genome.json</code>, and <code>parameters.txt</code>.
                    </DocShot>
                </>
            );
        }

        return (
            <>
                <h2>Brownaming</h2>
                <DocShot imageKey="Image29" title="Standalone Brownaming Page">
                    The standalone Brownaming page is used to run only the Brownaming module. To use it, enter a species in the species field,
                    provide a protein FASTA file, and configure the same Brownaming options that also appear in Create Annotation. The resulting
                    outputs are interpreted exactly like the Brownaming section documented in the section 'My Annotations & Results'.
                </DocShot>
            </>
        );
    };

    return (
        <div id="page">
            <div className="navigation-buttons">
                <button className="t2_bold left" onClick={handleBack}>
                    ← Back
                </button>
            </div>
            <div className="about-container">
                <h2 className="home-h2">About Brownotate</h2>
                <div className="about-layout">
                    <aside className="about-nav">
                        <h3>Documentation</h3>
                        {pages.map((page) => (
                            <button
                                key={page.id}
                                className={`about-nav-item ${activePage === page.id ? 'active' : ''}`}
                                onClick={() => setActivePage(page.id)}
                            >
                                {page.label}
                            </button>
                        ))}
                    </aside>
                    <section className="about-doc">
                        {renderPage()}
                    </section>
                </div>
            </div>
        </div>
    );
}