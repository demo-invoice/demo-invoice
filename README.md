# demo-invoice

Initialized by your AI team so we have a base branch to build on.

## New Invoice / Clear Button

Clicking the **New Invoice** button in the header opens a browser confirmation
dialog with the message:

> This will clear all current invoice data. Are you sure?

If the user confirms, all persisted invoice data is removed from `localStorage`
and the form resets to its default state (invoice number resets to `INV-001`,
issue date resets to today's date).

If the user cancels, no changes are made.
