# sinking-feeling
Group project primary repository


# Getting Started with Meteor

## Windows
1. Install [meteor](https://install.meteor.com/windows) as admin user.
2. Reboot (for some reason it doesn't get added to the path automatically).
3. From git root, start meteor `meteor`

## Linux (Tested on Ubuntu 14.04/16.04)
1. Run setup
    1. Get setup script `curl https://install.meteor.com/ > meteor_setup.sh`
    2. Make executable `chmod +x meteor_setup.sh`
    3. Run Setup `./meteor_setup.sh`
2. From git root, start meteor `meteor`

## Cloud9
1. Create a [cloud9 account](https://c9.io/signup)
2. Get your cloud9 ssh key and import it into github
    1. Go to Account Settings -> [SSH Keys](https://c9.io/account/ssh)
    2. Copy the stuff in the box (this is your public key, it isn't something you need to keep secret)
    3. Login to github and go to Settings -> [SSH and GPG keys](https://github.com/settings/keys)
    4. Click the "New SSH key" button
    5. Enter a title like "Cloud9" and paste your public key in the box. Click the "Add SSH key" button.
3. Create a new [workspace](https://c9.io/new)
    1. Enter project name ("sinking-feeling"?) and Description
    2. Enter your github fork to clone from (git@github.com:YOUR_USERNAME/sinking-feeling.git)
    3. Select the "Meteor" template
    4. Create Workspace
4. Manually switch to the develop branch `git checkout develop`
5. Start meteor `meteor --port $PORT`

## Google Authentication
1. Go to the [Google APIs Console](https://console.developers.google.com/apis/)
    1. Use "Create a project...".
    2. Go to the "Credentials" tab on the left.
    3. Select the "OAuth consent secreen" at the top. Fill in "Product name shown to users", then click "Save".
    4. You should end up back at the "Credentials" tab with a prompt about needing credentials to access APIs. Click "Create credentials" and then select "OAuth client ID" from the dropdown list.
        1. For Application type, select "Web application".
        2. Populate name as you like.
        3. For "Authorized JavaScript origins", put in the base domain URI for the application. For example, https://sinking-feeling-nagledb.c9users.io/
        4. For "Authorized redirect URIs", put in the base domain URI followed by /_oauth/google. For example: https://sinking-feeling-nagledb.c9users.io/_outh/google
        5. Click "Create"
    5. You'll be provided with the client ID and client secret. Note these, you'll need them later.
2. Start up Meteor. You'll need to provide a ROOT_URL environment variable specifying its base URL. For example: ROOT_URL=https://sinking-feeling-nagledb.c9users.io meteor --port $PORT
3. Visit the running application. You'll see a button logging in with Google. Click it and provide the information it requests.
4. You should now be able to log in.