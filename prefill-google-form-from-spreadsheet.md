---
title: How to prefill a Google Form from a spreadsheet (a link for every row, free)
description: Generate a pre-filled Google Form link for each row of a Google Sheet, matched by question title, and email each person their own link. Free Apps Script, no add-on.
---
{% raw %}

# How to prefill a Google Form from a spreadsheet (a link for every row, free)

Google Forms has a **Get pre-filled link** option, but it makes one link at a time, by hand. If you need a link per person (an employee survey with their department filled in, an order confirmation with the order number, an RSVP with the guest's name), you want the spreadsheet to build them. This guide does that with one free Apps Script file.

It uses [Form Prefill Links](https://github.com/DecodedXR/form-prefill-links), a free, MIT-licensed script.

## Step 1: Match your columns to the questions

The script pairs each column with the form question that has the same title. Capitalization and extra spaces are ignored:

| Your name | Department | Employee ID | Email |
|---|---|---|---|
| Ana Lopez | Finance | 1042 | ana@example.com |
| Ben Okafor | Sales | 1043 | ben@example.com |

If the form asks "Your name", "Department" and "Employee ID", those three are prefilled. The **Email** column doesn't match a question, so it's ignored here; it's handy for sending the links later.

How each question type is filled:

- **Short answer / paragraph:** the cell's text
- **Multiple choice / dropdown:** the cell must match one of the choices exactly (or the question must allow "Other")
- **Checkboxes:** choices separated by commas, like `Mon, Wed`
- **Linear scale:** a number
- **Date:** a date cell

## Step 2: Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Delete the placeholder code, paste in [`Code.gs`](https://github.com/DecodedXR/form-prefill-links/blob/main/Code.gs), and **Save**.
3. Reload the sheet. A **🔗 Prefill** menu appears.

## Step 3: Make the links

Choose **🔗 Prefill → Make Prefilled Links**. When asked, paste the form's **edit link**: open the form in the editor and copy the address bar (it ends in `/edit`). Approve Google's permission prompt the first time ("Google hasn't verified this app" → **Advanced → Go to (your project name) → Allow**; it's your own script).

A **Prefilled Link** column appears, with one link per row. The summary lists which questions were matched, so you can catch a misspelled column.

Changed the sheet? Run it again and every link is rebuilt.

## Step 4: Send each person their link

With [Sheets Mail Merge](https://decodedxr.github.io/sheets-mail-merge/free-mail-merge-google-sheets.html) in the same sheet, write a Gmail draft like:

> **Subject:** `{{Your name}}, 2 minutes for the team survey?`
>
> Hi {{Your name}}, your department is already filled in: {{Prefilled Link}}

Each person gets their own link.

## FAQ

**Can respondents change the prefilled answers?** Yes. Prefilled answers are defaults, not locked values. To check them afterwards, compare the responses with your sheet.

**Why do I need the edit link?** Google only creates prefilled links through the form's edit access. Respondents only ever see the normal form.

**Which questions can't be prefilled?** Grids, time and file-upload questions. They're left blank.

**Is it free?** Yes. It's MIT licensed and runs on your Google account. Building links doesn't send any email.

---

[Get the script on GitHub](https://github.com/DecodedXR/form-prefill-links) · Also free: [custom confirmation emails from Google Forms](https://decodedxr.github.io/form-auto-reply/google-forms-custom-confirmation-email.html)
{% endraw %}
