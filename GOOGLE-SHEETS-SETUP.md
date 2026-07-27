# Connect the tracker to Google Sheets

The website is prepared to use this spreadsheet:

`https://docs.google.com/spreadsheets/d/1qJZQIpmhnWsTNRzKKJkHq0sTDlAxtumq-bfviREMCdE`

## 1. Add the bridge to the sheet

1. Open the spreadsheet.
2. Select **Extensions → Apps Script**.
3. Delete the sample code.
4. Copy everything from `google-apps-script/Code.gs` into the editor.
5. Select **Save**.

## 2. Publish the bridge

1. In Apps Script, select **Deploy → New deployment**.
2. Choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**.
5. Select **Deploy**, approve access, and copy the `/exec` URL.

## 3. Vercel

The deployed `/exec` URL is already configured as the project's default, so no
extra Vercel setting is required. You can optionally override it later with the
`NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` environment variable.

The site loads existing rows from the Day 1–4 tabs and writes every saved update
back to the correct company row.
