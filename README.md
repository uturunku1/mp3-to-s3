# MP3-To-S3

## Description
This Lambda function takes a youtube video Id (from a custom Event JSON object) and converts the video into an MP3 file using the Node.JS library YoutubeMP3Downloader. Then it saves it to a S3 bucket and returns the S3 URL link. These node modules and FFMPEG binaries are statically built for Amazon Linux System.

## Lambda Settings by running bash script

- Clone this repository
- in file `deploy.sh` make sure to change value of variable ROLE to your correct arn role and your preferred S3 region.
- in file `input.txt` adjust youtube video Id and bucket name. Warning: do not edit `input.txt` outside of a code editor.
- In terminal cd into the root directory of this folder and enter:
- $chmod +x deploy.sh
- $./deploy.sh

## Lambda Settings Manually

- Clone repository
- zip file repository from terminal: zip -r ../index.zip *
- upload zip file to S3 bucket (because the size is more than 10MB)
- Create Function in Lambda console, using the following settings:
- Upload a file from Amazon S3: Code entry type
- Runtime: `Node.js 6.10`
- Handler: `index.handler`
- Timeout: 1 minute
- Configure test event: with event structure given bellow

### Basic Settings

Set the memory to `1536 MB`(XD) AND increase the timeout to `1 minute`.

### Execution Role

To use S3, you will need to create a execution role with the correct permission.

### Triggers and Data
The trigger event will be a JSON object. If the videoUrl property is set to null, the program will look for a MP3 file in a selected S3 bucket.

Event structure:

{
  "videoUrl": "lRs72x7Lgtc",
  "bucketDestination": "democracy-live"
}
