# Fixing Mobile Job Update Issue

## Goal
Fix the `405 Method Not Allowed` error when updating jobs from the mobile app and implement the requested confirmation flow for saving changes.

## User Review Required
> [!IMPORTANT]
> The backend currently only supports `PATCH` for partial updates, but the mobile app sends a `PUT` request. usage. We will implement `PUT` to handle full updates (including nested steps/substeps if needed) or map it to the logic required.
> Additionally, we will add a "Are you sure?" confirmation dialog on the mobile app before submitting updates.

## Proposed Changes

### Backend API

#### [MODIFY] [route.ts](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/app/api/admin/jobs/[id]/route.ts)
- Implement `PUT` method.
- Logic should allow updating core fields: `title`, `description`, `customerId`, `teamId`, `priority`, `status`, `acceptanceStatus`, `location`, `scheduledDate`, `scheduledEndDate`.
- Should also handle `steps` update if necessary (or verify if steps are updated separately). The current `useJobForm` sends `steps` in the payload.
- *Note:* `PATCH` currently uses a restrictive schema (`updateJobSchema`). `PUT` should use a more comprehensive schema matching `useJobForm` payload.

### Mobile UI

#### [MODIFY] [EditJobScreen.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/screens/admin/EditJobScreen.js)
- Modify `onSubmit` to show an `Alert.alert` confirmation dialog:
    - Title: "Güncellemeyi Onayla"
    - Message: "Bu iş emrindeki değişiklikleri kaydetmek istediğinize emin misiniz?"
    - Actions: "İptal", "Evet, Kaydet".
- Only proceed to `submitJob` upon confirmation.
- On success, show another alert: "Başarılı", "İş başarıyla güncellendi." -> confirm -> `navigation.goBack()`.

## Verification Plan

### Manual Verification
1.  **Mobile App**: Open a job in Edit mode. Change title or status.
2.  **Confirmation**: Click "Update". Ensure "Are you sure?" alert appears.
3.  **Submission**: Confirm. Ensure backend receives the request and returns 200 (not 405).
4.  **Success**: Ensure success alert appears and navigates back.
5.  **Data Check**: Verify changes are reflected in the list/detail view.

### Automated Tests
- None specific for this UI flow, but manual end-to-end test is crucial.
