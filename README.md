# Brownotate App

## Overview

Brownotate App is a web application built with React.js that facilitates the use of Brownotate to generate a protein sequence database for every species.

## Prerequisites

Before you start, ensure you have the following software installed on your server:

- **Node.js and npm**: Node.js is a JavaScript runtime, and npm is a package manager for JavaScript. For installation instructions, visit the [npm website](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
- **Apache**: A web server for hosting your app. For installation instructions, visit the [Apache website](https://httpd.apache.org/).

To install these on a system using `apt` (such as Ubuntu), run:

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

4. **Build the React application:**

    ```bash
    npm run build
    ```

5. **Copy the build files to the Apache web directory:**

    ```bash
    sudo cp -r /path/to/your/build /var/www/brownotate-app
    ```

6. **Create an Apache configuration file for the application:**

    Create `/etc/apache2/sites-available/brownotate-app.conf` with the following content:

    ```apache
    <VirtualHost *:80>
        ServerAdmin webmaster@localhost
        ServerName <your.ip>
        DocumentRoot /var/www/brownotate-app

        <Directory /var/www/brownotate-app>
            Options FollowSymLinks
            AllowOverride All
            Require all granted
        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
    </VirtualHost>
    ```

7. **Enable the new site configuration:**

    ```bash
    sudo a2ensite /etc/apache2/sites-available/brownotate-app.conf
    ```

8. **Enable the Apache site configuration and restart Apache:**

    ```bash
    sudo a2ensite brownotate-app.conf
	sudo systemctl restart apache2
    ```

## Using the Interface

To use this interface, you need to set up a server with the Brownotate program installed, along with the associated MongoDB database. You can follow the instructions provided in the [Brownotate GitHub repository](https://github.com/LSMBO/Brownotate) to install and configure these.

Once installed and deployed, update the `src/config.js` file with the IP address of your server.

#### Login
Upon successful setup, you can access the interface. Start by entering your email and password. These credentials must be added by an administrator in the production database on the Brownotate server (see instructions in [Brownotate GitHub](https://github.com/LSMBO/Brownotate)).

If authentication is successful, you will be redirected to the **Home** page, where you can search for species by entering the Latin name or taxid. You have two options:

1. **Database Search**  
   This triggers a request to the Brownotate server to find available biological data for the species. The interface displays protein, assembly, and sequencing datasets from NCBI, ENSEMBL, and UniprotKB databases. You can navigate to these datasets' pages and select a protein dataset to download. You may also select an assembly or sequencing dataset and click **Run** to move to the Settings page.

2. **Settings**  
   You can directly navigate to the **Settings** page.

#### Settings Page
On this page, you can configure your Brownotate run. Start by specifying whether you are working with a sequencing dataset or an assembly.  
- If you choose sequencing, you can either upload a fastq file from your computer or provide an accession number to download the dataset automatically.  
- If you choose assembly, you have to upload a fasta file from your computer. 

If you come from the Database Search, the selected datasets will already be filled in for you.

Next, you can skip certain steps in the Brownotate pipeline or modify parameters. For more information about the Brownotate pipeline, please refer to [Brownotate GitHub](https://github.com/LSMBO/Brownotate).  
Finally, click **Run** to start the Brownotate process and return to the Home page.

#### Run Cards
On the Home page, you can view and manage all of your runs. Each run is displayed as a card, showing its current status. There are several possible statuses:

- **Upload**: The initial stage where the input data is being transferred to the Brownotate server.
- **Running**: Brownotate is actively processing the run.
- **Completed**: The run finished successfully.
- **Failed**: An error occurred during the run. A **Resume** button will appear on the run card, allowing you to attempt to restart the run from where it stopped.
- **Incomplete**: The run finished but did not generate a full protein sequence database. You can still view the assembly results, but you may need to retry the run with different input data.

Each run card also has a delete option. You can remove a run by clicking the **X** button in the card.

Clicking on a run card will take you to the **Run** page, where you can view more detailed information about that specific run.

#### Run Page
The **Run** page has two sections: **Results** and **Parameters**.

1. **Parameters**  
   This section shows the settings and input files used for the run.

2. **Results**  
   This section is visible for all runs except those with the status **Upload** or **Running**.
   - **Download**: You can download the assembly and annotation FASTA files individually. Additionally, you can download the entire Brownotate working directory, which includes these files along with detailed information about the run. After the protein prediction stage, **Brownaming** is used to assign names to the predicted proteins via BLAST comparison. You can download the Brownaming working directory as a ZIP file, which provides further insights into how protein names were assigned. For more details on Brownaming, please refer to the [Brownotate GitHub](https://github.com/LSMBO/Brownotate).
   - **Busco Results**: Displays the evaluation of assembly and annotation completeness. For more details on Busco, see [Brownotate GitHub](https://github.com/LSMBO/Brownotate).  
   - **Log**: Lists all Brownotate execution steps, along with timestamps.  
   - **stdout** and **stderr**: Standard console outputs, useful for debugging failed runs.

For **Incomplete** runs, downloading annotation and Brownaming results is disabled as the annotation was unsuccessful.
