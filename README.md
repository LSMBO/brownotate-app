# Brownotate App

## Overview

Brownotate App is a web application built with React.js that facilitates the use of Brownotate to generate a protein sequence database for any species.

Before setting up your own Brownotate server, you can try a ***demo version*** without installing anything. Simply contact me at browna@unistra.fr, and I will create an account for you on the server hosted at my institute.

## Prerequisites

Ensure you have the following software installed on your server:

- **Node.js and npm**: Node.js is a JavaScript runtime, and npm is a package manager for JavaScript. For installation instructions, visit the [npm website](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
- **Apache**: A web server for hosting your app. For installation instructions, visit the [Apache website](https://httpd.apache.org/).

To install these on a Debian-based system (such as Ubuntu), run:

```bash
sudo apt update
sudo apt install nodejs
sudo apt install npm
sudo apt install apache2
```

## Deployment Instructions

Follow these steps to deploy the React application:

1. **Clone the React project repository:**

    ```bash
    git clone https://github.com/LSMBO/brownotate-app.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd brownotate-app
    ```

3. **Install project dependencies:**

    ```bash
    npm install
    ```

4. **Complete the configuration file**

Set the value of **API_BASE_URL** in the **src/config.js** file. This should be the IP address and port where the Flask server is listening. 
For example, if the server is located at **http://1.2.3.4.8800**, the client request are send to the IP address 1.2.3.4 and port 8800. 
To set up the Flask server, please follow the instruction provided in [Brownotate GitHub repository](https://github.com/LSMBO/Brownotate)

5. **Build the React application:**

    ```bash
    npm run build
    ```

6. **Copy the build files to the Apache web directory:**

    ```bash
    sudo cp -r /path/to/your/build/* /var/www/brownotate-app
    ```

7. **Create an Apache configuration file for the application:**

    Create `/etc/apache2/sites-available/brownotate-app.conf` with the following content:

    ```apache
    <VirtualHost *:80>
        ServerAdmin webmaster@localhost
        ServerName <client.ip>
        DocumentRoot /var/www/brownotate-app

        <Directory /var/www/brownotate-app>
            Options FollowSymLinks
            AllowOverride All
            Require all granted

            RewriteEngine On
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^ /index.html [L]

        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
    </VirtualHost>
    ```

8. **Enable URL rewriting and site configuration:**

    ```bash
    sudo a2enmod rewrite
    sudo a2ensite brownotate-app
    ```

These commands enable the rewrite module in Apache, which allow for flexible URL rooting, and then enables the site configuration.

9. **Enable Proxy and Configure SSL for API Communication:**

A proxy allows Apache to act as an intermediary between the HTTPS client and the Flask server. It forwards requests from the client to Flask and ensures the communication stays secure. 

To configure the Proxy, you have to 

- Enable the Apache proxy modules:

    ```bash
    sudo a2enmod proxy
    sudo a2enmod proxy_http
    ```

- Add the following lines to your Apache config file **/etc/apache2/sites-available/brownotate-app.conf**:

    ```apache
    ProxyPass /api http://flask.ip:port
    ProxyPassReverse /api http://flask.ip:port
    ProxyTimeout 2592000
    ```   

ProxyTimeout sets the maximum time (in seconds) that Apache will wait for a response from the Flask application, starting from the moment it sends the request.

- Update the **API_BASE_URL** in **src/config.js** to **http://client.ip/api** (or **https://domain-name/api** if you had configure a domain name)

The client will send requests to **http://client.ip/api**, which Apache will forward to **http://flask.ip:port**. The **ProxyPassReverse** ensures that responses from Flask are corretly returned to the client.

Note: Even when using HTTP, it is considered good practice to use a Proxy to manage traffic between the client and the server. However, with HTTPS, it becomes essential. Browsers block mixed content (requests sent over HTTP when the page is loaded over HTTPS) because it compromises security. Using a proxy ensures that requests are securely forwarded from the client to the Flask backend, maintaining an HTTPS context and avoiding any security issues.


9. **Enable the Apache site configuration and restart Apache:**

    ```bash
    sudo a2ensite brownotate-app.conf
	sudo systemctl restart apache2
    ```

10. **Configure a Domain and Enable SSL for a Secure Connection**

At this stage, the application will be running but will be accessible only over HTTP, which is not secure. It is recommended to set up a DNS domain associated with the public IP address to create an SSL certificate, allowing for a secure HTTPS connection. You will need to replace the IP address in the Apache configuration file with the domain name to enable SSL.

Replace 
    ```bash
    ServerName <client.ip>
    ```
by 
    ```bash
    ServerName <domain-name>
    ```
in `/etc/apache2/sites-available/brownotate-app.conf`

After making this change, restart Apache to apply the new configuration:
    ```bash
    sudo systemctl restart apache2
    ```

- Install Certbot with the following command (for Debian-based system)

    ```bash
    sudo apt install certbot python3-certbot-apache
    ```

- Run the following command to obtain and install the SSL certificate

    ```bash
    sudo certbot --apache
    ```

This command will prompt you to specify the domain for which to create the certificate. Once completed, it will automatically update the Apache configuration files.

- Check the generated SSL configuration file located at **/etc/apache2/sites-available/brownotate-app-le-ssl.conf** to ensure that the following lines are present:

    ```apache
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/domain-name/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/domain-name/privkey.pem
    ```

- Make sure you have the following lines in the new config file

    ```apache
    ProxyPass /api http://flask.ip:port
    ProxyPassReverse /api http://flask.ip:port
    ```    

- Disable the HTTP configuration and enable the HTTPS site configuration:

    ```bash
    sudo a2dissite brownotate-app.conf
    sudo a2ensite brownotate-app-le-ssl.conf
    ```

- Restart Apache to apply changes:
    ```bash
    sudo systemctl restart apache2
    ```

## Using the Interface

#### Login
Once the interface has been successfully configured, you can access the interface. Start by entering your email and password. These credentials must be added by an administrator in the mongodb database on the Brownotate server (see instructions in [Brownotate GitHub](https://github.com/LSMBO/Brownotate)). 
If authentication is successful, you will be redirected to the **Home** page.

#### Home (Database Search)

This page provides access to publicly available biological data for any species. A Latin name or Taxonomic ID can be entered, followed by a click on Search. The interface then queries the Brownotate server to retrieve available datasets.
A table at the bottom of the page lists proteins, assemblies, and sequencing datasets from NCBI (RefSeq, GenBank, SRA), ENSEMBL, and UniProtKB. Each entry includes a link to the corresponding database page.
Protein datasets can be downloaded, and assemblies or sequencing datasets can be selected to configure an annotation run via the Configure the run with the selected sequencing/assembly button.
Database searches can be customized by disabling specific sources, which is useful when certain data types (e.g., sequencing datasets) are not required.
Previously completed searches can be reloaded using the Load previous searches button.
Once loaded, the results table appears.
A phylogeny map showing the taxonomic distance between retrieved species can be generated using the purple button below the table.
The 'How does it work' button provides additional information about the search process.
Navigation from the Home page is possible toward the My Annotations or Settings pages.

#### Settings

This page is used to configure and launch the Brownotate annotation pipeline.
The settings are organized into several sections.

*Start Section*

This section defines the genomic input data to annotate:

Sequencing data
-	FASTQ files can be uploaded directly, or
-	An SRA accession number (typically starting with SRR or ERR) can be provided
-	When uploading custom FASTQ files, the sequencing platform must be specified

Assembly data
-	A FASTA file can be uploaded

If data were selected from the Database Search page, the corresponding fields are automatically pre-filled.

*Assembly Section*

The assembly workflow depends on the sequencing technology:

-	Short reads (Illumina or similar): The assembler Megahit is used. 
Optional preprocessing steps include:
-	fastp: removal of low-quality reads
-	Bowtie2 (PhiX removal): removal of PhiX spike-in reads

-	Long reads (PacBio or Nanopore): The assembler CANU is used.
CANU performs trimming and quality control internally, so fastp and Bowtie2 are not shown.


*Protein Prediction Section*

This section allows configuration of a minimum sequence length threshold and optional removal of duplicated sequences.

*Augustus Parameters Section*

This section is disabled for prokaryotes, as Prokka is used instead of Augustus.
Augustus relies on species models trained on known data. In Brownotate, protein FASTA files serve as protein evidence. By default, Brownotate automatically selects proteins from a closely related organism, but a custom FASTA file can also be provided.
Protein evidences help Augustus identify gene structures in the assembly and improve gene prediction accuracy.

*Functional Annotation Section*

Predicted proteins are unnamed at this stage.
If enabled, the functional annotation module assigns names by searching for similar proteins in UniProtKB. First among closely related species, then progressively across broader taxonomic levels.

Additional options include:
-	excluding specific species from the search
-	limiting the maximum taxonomic expansion
-	ignoring UniProt trEMBL entries to restrict the search to curated SwissProt proteins

*BUSCO Section*

BUSCO evaluates the completeness of genome assemblies and annotations by detecting conserved orthologs.
Available options:
-	Evaluate Assembly Completeness
-	Evaluate Annotation Completeness



If not already specified, the species to annotate must be indicated at the top of the Settings page.
The Run Brownotate button launches the pipeline and redirects to the My Annotations page.
Navigation from the Settings page is possible toward the Home or Functional Annotation pages.


*Functional Annotation*

The Functional Annotation module can be executed independently, without running the full pipeline.
To perform functional annotation:
-   Enter the Latin name or Taxonomic ID of the species
-   Upload a protein FASTA file
-   Optionnaly, apply additional options (same options that in th eFunctional Annotation Section of the Settings page)
-   Click on the Run button

The interface then redirects to the My Annotations page. The Back button at the top returns to the Settings page.


*My Annotations*

This page lists all annotation runs as cards. 
Functional annotation runs are highlighted in purple.
Each card displays the run status and a progress bar.
Possible statuses include:
-	Upload – input data is being transferred
-	Running – the pipeline is currently processing
-	Completed – the run finished successfully
-	Failed – an error occurred; a Resume button allows restarting the run
-	Incomplete – the run finished but did not produce a complete protein dataset

Each run can be refreshed, deleted, or explored.
The Parameters and Results buttons provide access to the configuration used and to downloadable output files.
Functional annotation results and BUSCO statistics are also displayed.
