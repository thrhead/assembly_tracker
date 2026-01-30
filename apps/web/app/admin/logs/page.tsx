import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

// Log seviyesine göre renk belirleyen yardımcı fonksiyon
function getBadgeVariant(level: string) {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return 'destructive';
    case 'WARN':
      return 'secondary';
    case 'INFO':
    default:
      return 'default';
  }
}

// Sunucu tarafında çalışacak ve logları getirecek sayfa bileşeni
export default async function AdminLogsPage() {
  const logs = await prisma.systemLog.findMany({
    take: 50, // Son 50 log kaydını alalım
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">System Logs</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Meta Data</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant={getBadgeVariant(log.level)}>{log.level.toUpperCase()}</Badge>
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  <pre className="text-xs p-2 bg-muted rounded-md">{JSON.stringify(log.meta, null, 2)}</pre>
                </TableCell>
                <TableCell className="text-right">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {logs.length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            No log entries found.
          </div>
        )}
      </div>
    </div>
  );
}
