```
npm install
npm run dev
```

```
open http://localhost:3000
```

## Parking-data cleanup

Set `CLEANUP_SECRET` in the API environment to a long, random value. The
cleanup endpoint does not use a user session or Bearer token, but it requires
this secret in the `X-Cleanup-Secret` header.

Use Postman to send a `POST` request to:

```
/api/v1/maintenance/cleanup-parking-data
```

An empty JSON body (or `{}`) is a dry run. It reports the number of parking
logs and completed tickets with an `exitTime` older than three months that would
be deleted. It does not delete data.

To permanently delete those records, send:

```json
{ "execute": true }
```

The endpoint deletes matching `ParkingLog` records before their related
`ParkingTicket` records in one database transaction. Active or unpaid tickets
are not eligible for deletion.

## Old ticket cleanup

To delete every ticket—completed or not—with an `entryTime` older than three
months, use the same header with a `POST` request to:

```
/api/v1/maintenance/cleanup-old-parking-tickets
```

This endpoint also defaults to a dry run. Send `{ "execute": true }` only
after reviewing the reported counts. It deletes related logs before tickets in
one transaction.
