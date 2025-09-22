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

If authentication is successful, you will be redirected to the **Home** page, where you can search for species by entering the Latin name or Taxonomic ID. You have two options:

1. **Database Search**  
   
   This triggers a request to the Brownotate server to find available biological data for the species. If a Database search has already been carried out for your species, the interface will display the results with the date of the corresponding search. The option **Retry the search with today's data** appears to execute a new Database search.

   The Database search can take up to fifteen minutes, depending on the organism.
   
   The interface displays proteins, assemblies, and sequencing datasets from NCBI, ENSEMBL, and UniprotKB Databases. Each available resource can be evaluated by navigating to its page in the database (clickable link). You can then select and download a protein dataset. You can also select an assembly or sequencing dataset and click **Configure the run with the sequencing/assembly selected** to go to the Settings page.

2. **Settings**  

   You can directly navigate to the **Settings** page.

#### Settings Page

On this page, you can configure your Brownotate run. Start by specifying whether you are working with a sequencing dataset or an assembly.  

- If you choose sequencing, you can either upload a FASTQ file from your computer or provide an accession number to download the dataset automatically. Accession numbers are the identifier in the SRA database that often start with **SRR** or **ERR**.  

- If you choose assembly, you have to upload a FASTA file from your computer. 

If you had selected data from the Database Search, the datasets will already be filled in for you.

Next, you can skip certain steps in the Brownotate pipeline or modify parameters. 

- Sequencing advanced parameters: You can choose to skip fastp, which filters out low-quality reads, and/or bypass the removal of reads associated with the phix virus genome. This virus is used in some Illumina sequencing processes for quality control.

*Annotation section*

Protein evidences: This refers to a collection of proteins used to identify specific genes in the genome assembly. These genes help train a gene prediction model, which is operated by the tool Augustus to predict the locations of all genes in the genome.

If **Auto** is selected, a protein dataset from related organisms is automatically searched in various databases, similar to the Database Search process.
If **Evidence file** is selected, you can upload a FASTA file containing your own set of protein sequences.

Note: This step is skipped for prokaryotes, as their simpler gene structure is handled by a different tool, Prokka, instead of Augustus.

- Minimal sequence length: Set a cutoff to exclude proteins shorter than the specified length (in amino acids).

- Remove duplicated sequences: Choose to either remove identical sequences of the same length, or eliminate shorter sequences that are fully contained within longer ones. If no option is selected, duplicates will be kept.

*Brownaming section*

Brownaming is an in-house tool that assigns protein names by searching for the most similar known proteins in UniprotKB from closely related species. If no close match is found, the search expands to broader taxonomic levels.

- Skip Brownaming: Choose this option to bypass the Brownaming step.

- Excluded Species: Exclude specific species from the search by entering the species name or taxonomic ID and clicking the Add button to add them to the exclusion list.

- Highest Taxa Rank: Set the taxonomic level where the search should stop. Choosing a rank that is too broad can significantly increase the processing time. The default "Suborder" rank offers a good balance between accuracy and processing time.

*Busco section*

Busco is a tool used to assess the completeness of genome assemblies and annotations by searching for conserved orthologs, which are genes that exist in the genomes of a group of related species.

- Evaluate Assembly Completeness: Check this option to assess the completeness of the genome assembly.

- Evaluate Annotation Completeness: Check this option to evaluate the completeness of the gene annotation.

*Computational ressource management section*

All server CPUs are shown as grey circles, with red circles indicating those currently in use. 
- Select how many CPUs you want for your run. You can use all available CPUs minus one (keeping at least one free). 
Using multiple CPUs is recommended, as running on a single CPU can take much longer.

Once the run has been launched with the ***Run*** button, it will appear as a card at the bottom of the main page. If you are starting from a sequencing dataset, calculation times can take up to two weeks if your species has a large genome.

#### Run Cards

On the Home page, you can view and manage all of your runs. Each run is displayed as a card, showing its current status. There are several possible statuses:

- **Upload**: The initial stage where the input data is being transferred to the Brownotate server.
- **Running**: Brownotate is actively processing the run.
- **Completed**: The run finished successfully.
- **Failed**: An error occurred during the run. A **Resume** button will appear on the run card, allowing you to attempt to restart the run from where it stopped.
- **Incomplete**: The run finished but did not generate a full protein sequence database. You can still view the assembly results, but you may need to retry the run with different input data.

Each run card also has a delete option. You can remove a run by clicking the **X** button in the card.

Clicking on a run card will take you to the **Run** page, where you can view more detailed information about that specific run.

Below the run cards, the 'Update runs' button allows you to manually refresh the status of the runs. This forces a query to the database to update the run statuses.

#### Run Page

The **Run** page has two sections: **Results** and **Parameters**.

1. **Parameters**  

   This section shows the settings and input files used for the run.

2. **Results**  

   This section is visible for all runs except those with the status **Upload** or **Running**.

   - **Download**: You can download the assembly and annotation FASTA files individually. Additionally, you can download the entire Brownotate working directory, which includes these files along with detailed information about the run. After the protein prediction stage, **Brownaming** is used to assign names to the predicted proteins via BLAST comparison. You can download the Brownaming working directory as a ZIP file, which provides further insights into how protein names were assigned.
   
   - **Busco Results**: Displays the evaluation of assembly and annotation completeness.
   
   - **Log**: Lists all Brownotate execution steps, along with timestamps.  
   
   - **stdout** and **stderr**: Standard console outputs, useful for debugging failed runs.

For **Incomplete** runs, downloading annotation and Brownaming results is disabled as the annotation was unsuccessful.
