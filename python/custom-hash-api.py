## This was mined from slack after putting together the nodejs example code.
## Putting it here for posterity, as well as for teams who may be more proficient with Python
## written by: Michael Aminov
## slack: https://wiz-sec.slack.com/archives/C05BS1YDWFK/p1706791320440639?thread_ts=1706726483.611339&cid=C05BS1YDWFK

"""
Python 3.6+
pip(3) install requests
"""
import base64
import json
import requests

# Standard headers
HEADERS_AUTH = {"Content-Type": "application/x-www-form-urlencoded"}
HEADERS = {"Content-Type": "application/json"}

# Wiz Service account details, the required permissions are: update:scanner_settings, update:custom_file_detection
CLIENT_ID = "<replace with wiz service account>"
CLIENT_SECRET = "<replace with wiz service account>"

FILE_TO_UPLOAD = "<replace with local filename that contains the IOCs>"

# Uncomment the following section to define the proxies in your environment,
#   if necessary:
# http_proxy  = "http://"+user+":"+passw+"@x.x.x.x:abcd"
# https_proxy = "https://"+user+":"+passw+"@y.y.y.y:abcd"
# proxyDict = {
#     "http"  : http_proxy,
#     "https" : https_proxy
# }

# The GraphQL query that defines which data you wish to fetch.
UPLOAD_QUERY = """
    query RequestFileDetectionUploadURL($filename: String!) {
      requestScannerSettingsCustomFileDetectionListUpload(filename: $filename) {
        upload {
          id
          url
        }
      }
    }
"""

# The variables sent along with the above query
UPLOAD_VARIABLES = {
  "filename": FILE_TO_UPLOAD
}


UPDATE_QUERY = """
    mutation UpdateScannerSamplingSettings($input: UpdateScannerSettingsInput!) {
      updateScannerSettings(input: $input) {
        scannerSettings {
          computeResourceGroupMemberScanSamplingEnabled
          maxComputeResourceGroupMemberScanCount
          customFileDetectionList {
            id
            url
            fileDetectionCount
          }
        }
      }
    }
"""


def query_wiz_api(query, variables, dc):
    """Query Wiz API for the given query data schema"""

    data = {"variables": variables, "query": query}

    try:
        # Uncomment the next first line and comment the line after that
        # to run behind proxies
        # result = requests.post(url=f"https://api.{dc}.app.wiz.io/graphql",
        #                        json=data, headers=HEADERS, proxies=proxyDict, timeout=180)
        result = requests.post(url=f"https://api.<replace with your Wiz data center>.app.wiz.io/graphql",
                               json=data, headers=HEADERS, timeout=180)

    except requests.exceptions.HTTPError as e:
        print(f"<p>Wiz-API-Error (4xx/5xx): {str(e)}</p>")
        return e

    except requests.exceptions.ConnectionError as e:
        print(f"<p>Network problem (DNS failure, refused connection, etc): {str(e)}</p>")
        return e

    except requests.exceptions.Timeout as e:
        print(f"<p>Request timed out: {str(e)}</p>")
        return e

    return result.json()


def request_wiz_api_token(client_id, client_secret):
    """Retrieve an OAuth access token to be used against Wiz API"""

    auth_payload = {
      'grant_type': 'client_credentials',
      'audience': 'wiz-api',
      'client_id': client_id,
      'client_secret': client_secret
    }
    try:
        # Uncomment the next first line and comment the line after that
        # to run behind proxies
        # response = requests.post(url="https://auth.app.wiz.io/oauth/token",
        #                         headers=HEADERS_AUTH, data=auth_payload,
        #                         proxies=proxyDict, timeout=180)
        response = requests.post(url="https://auth.app.wiz.io/oauth/token",
                                headers=HEADERS_AUTH, data=auth_payload, timeout=180)

    except requests.exceptions.HTTPError as e:
        print(f"<p>Error authenticating to Wiz (4xx/5xx): {str(e)}</p>")
        return e

    except requests.exceptions.ConnectionError as e:
        print(f"<p>Network problem (DNS failure, refused connection, etc): {str(e)}</p>")
        return e

    except requests.exceptions.Timeout as e:
        print(f"<p>Request timed out: {str(e)}</p>")
        return e

    try:
        response_json = response.json()
        token = response_json.get('access_token')
        if not token:
            message = f"Could not retrieve token from Wiz: {response_json.get('message')}"
            raise ValueError(message)
    except ValueError as exception:
        message = f"Could not parse API response {exception}. Check Service Account details " \
                    "and variables"
        raise ValueError(message) from exception

    response_json_decoded = json.loads(
        base64.standard_b64decode(pad_base64(token.split(".")[1]))
    )

    response_json_decoded = json.loads(
        base64.standard_b64decode(pad_base64(token.split(".")[1]))
    )
    dc = response_json_decoded["dc"]

    return token, dc


def pad_base64(data):
    """Makes sure base64 data is padded"""
    missing_padding = len(data) % 4
    if missing_padding != 0:
        data += "=" * (4 - missing_padding)
    return data

def upload_file_to_s3_presigned_url(file_path, presigned_url):
    with open(file_path, 'rb') as file:
        response = requests.put(presigned_url, data=file)
    
    if response.status_code == 200:
        print("File uploaded successfully")
    else:
        print(f"Error uploading file. Status code: {response.status_code}")
        print(response.text)



def main():
    """Main function"""

    print("Getting token")
    token, dc = request_wiz_api_token(CLIENT_ID, CLIENT_SECRET)
    HEADERS["Authorization"] = "Bearer " + token

    result = query_wiz_api(UPLOAD_QUERY, UPLOAD_VARIABLES, dc)
    #print(result)  # your data is here!
    
    print("Got presigned URL from Wiz")
    url = result["data"]["requestScannerSettingsCustomFileDetectionListUpload"]["upload"]["url"]
    upload_id = result["data"]["requestScannerSettingsCustomFileDetectionListUpload"]["upload"]["id"]
    
    print(f"uploading {FILE_TO_UPLOAD} to Wiz S3 Bucket")
    upload_file_to_s3_presigned_url(FILE_TO_UPLOAD, url)

    # The variables sent along with the above query
    UPDATE_VARIABLES = {
        "input": {
            "patch": {
                "customFileDetectionListUploadId": upload_id
            }
        }
    }

    
    result = query_wiz_api(UPDATE_QUERY, UPDATE_VARIABLES, dc)
    print("Updating the Wiz backend that there's a new file, result:")
    print(result)



if __name__ == '__main__':
    main()