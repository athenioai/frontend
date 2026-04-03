'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimeSavedWidgetProps {
  hoursSaved: number;
  tasksAutomated: number;
}

export function TimeSavedWidget({ hoursSaved, tasksAutomated }: TimeSavedWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Economia de Tempo</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{hoursSaved}h</div>
        <p className="text-xs text-muted-foreground mt-1">
          {tasksAutomated} tarefas automatizadas este mes
        </p>
      </CardContent>
    </Card>
  );
}
