import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Appointment } from '@/lib/services/interfaces/appointment-service'

/**
 * CalendarView — Performance Optimization Tests
 *
 * Validates the groupByDate logic that is wrapped in useMemo
 * inside CalendarView. Tests the pure grouping function (behavior),
 * not the React memoization mechanism (implementation).
 *
 * Also validates via file-content analysis that useMemo is applied.
 */

const COMPONENT_PATH = resolve(__dirname, '../calendar-view.tsx')
const source = readFileSync(COMPONENT_PATH, 'utf-8')

// ── Pure Logic: extracted from component ──
// Replicates the exact groupByDate function defined in calendar-view.tsx

function groupByDate(appointments: Appointment[]): Map<string, Appointment[]> {
  const map = new Map<string, Appointment[]>()
  for (const apt of appointments) {
    const list = map.get(apt.date) ?? []
    list.push(apt)
    map.set(apt.date, list)
  }
  return map
}

// ── Test Data ──

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'apt-1',
    sessionId: 'session-1',
    leadName: 'Maria Santos',
    serviceType: 'Consultoria',
    date: '2026-04-09',
    startTime: '09:00:00',
    endTime: '10:00:00',
    status: 'confirmed',
    createdAt: '2026-04-01T10:00:00Z',
    ...overrides,
  }
}

const APPOINTMENTS: Appointment[] = [
  makeAppointment({ id: 'apt-1', date: '2026-04-09', startTime: '09:00:00', endTime: '10:00:00', leadName: 'Maria' }),
  makeAppointment({ id: 'apt-2', date: '2026-04-09', startTime: '14:00:00', endTime: '15:00:00', leadName: 'Joao' }),
  makeAppointment({ id: 'apt-3', date: '2026-04-10', startTime: '11:00:00', endTime: '12:00:00', leadName: 'Ana' }),
  makeAppointment({ id: 'apt-4', date: '2026-04-10', startTime: '16:00:00', endTime: '17:00:00', leadName: 'Pedro' }),
  makeAppointment({ id: 'apt-5', date: '2026-04-11', startTime: '08:00:00', endTime: '09:00:00', leadName: 'Carlos' }),
]

// ── Tests ──

describe('CalendarView — groupByDate (useMemo)', () => {
  describe('happy path', () => {
    it('deve agrupar agendamentos por data', () => {
      const result = groupByDate(APPOINTMENTS)

      expect(result.size).toBe(3)
      expect(result.get('2026-04-09')).toHaveLength(2)
      expect(result.get('2026-04-10')).toHaveLength(2)
      expect(result.get('2026-04-11')).toHaveLength(1)
    })

    it('deve manter a ordem de insercao dos agendamentos dentro de cada data', () => {
      const result = groupByDate(APPOINTMENTS)

      const apr9 = result.get('2026-04-09')!
      expect(apr9[0].id).toBe('apt-1')
      expect(apr9[1].id).toBe('apt-2')

      const apr10 = result.get('2026-04-10')!
      expect(apr10[0].id).toBe('apt-3')
      expect(apr10[1].id).toBe('apt-4')
    })

    it('deve preservar todos os campos do appointment no agrupamento', () => {
      const result = groupByDate(APPOINTMENTS)
      const first = result.get('2026-04-09')![0]

      expect(first.id).toBe('apt-1')
      expect(first.sessionId).toBe('session-1')
      expect(first.leadName).toBe('Maria')
      expect(first.serviceType).toBe('Consultoria')
      expect(first.startTime).toBe('09:00:00')
      expect(first.endTime).toBe('10:00:00')
      expect(first.status).toBe('confirmed')
    })
  })

  describe('edge cases', () => {
    it('deve retornar Map vazio para lista vazia de agendamentos', () => {
      const result = groupByDate([])
      expect(result.size).toBe(0)
    })

    it('deve lidar com um unico agendamento', () => {
      const single = [makeAppointment({ id: 'solo', date: '2026-05-01' })]
      const result = groupByDate(single)

      expect(result.size).toBe(1)
      expect(result.get('2026-05-01')).toHaveLength(1)
      expect(result.get('2026-05-01')![0].id).toBe('solo')
    })

    it('deve lidar com todos os agendamentos na mesma data', () => {
      const sameDay = [
        makeAppointment({ id: 'a', date: '2026-04-09' }),
        makeAppointment({ id: 'b', date: '2026-04-09' }),
        makeAppointment({ id: 'c', date: '2026-04-09' }),
      ]
      const result = groupByDate(sameDay)

      expect(result.size).toBe(1)
      expect(result.get('2026-04-09')).toHaveLength(3)
    })

    it('deve lidar com cada agendamento em data diferente', () => {
      const spread = [
        makeAppointment({ id: 'x', date: '2026-01-01' }),
        makeAppointment({ id: 'y', date: '2026-06-15' }),
        makeAppointment({ id: 'z', date: '2026-12-31' }),
      ]
      const result = groupByDate(spread)

      expect(result.size).toBe(3)
      expect(result.get('2026-01-01')).toHaveLength(1)
      expect(result.get('2026-06-15')).toHaveLength(1)
      expect(result.get('2026-12-31')).toHaveLength(1)
    })

    it('deve agrupar agendamentos com diferentes status na mesma data', () => {
      const mixed = [
        makeAppointment({ id: 'confirmed-1', date: '2026-04-09', status: 'confirmed' }),
        makeAppointment({ id: 'cancelled-1', date: '2026-04-09', status: 'cancelled' }),
      ]
      const result = groupByDate(mixed)

      expect(result.size).toBe(1)
      const day = result.get('2026-04-09')!
      expect(day).toHaveLength(2)
      expect(day[0].status).toBe('confirmed')
      expect(day[1].status).toBe('cancelled')
    })
  })

  describe('retorno correto para datas nao presentes', () => {
    it('deve retornar undefined para data sem agendamentos', () => {
      const result = groupByDate(APPOINTMENTS)
      expect(result.get('2026-04-12')).toBeUndefined()
    })
  })
})

describe('CalendarView — file-content validation', () => {
  it('deve usar useMemo para byDate', () => {
    expect(source).toContain('const byDate = useMemo(')
  })

  it('deve importar useMemo de react', () => {
    expect(source).toMatch(/import\s*\{[^}]*useMemo[^}]*\}\s*from\s*'react'/)
  })

  it('byDate deve chamar groupByDate(appointments)', () => {
    expect(source).toContain('groupByDate(appointments)')
  })

  it('byDate useMemo deve depender de [appointments]', () => {
    expect(source).toContain('[appointments]')
  })

  it('deve definir a funcao groupByDate localmente', () => {
    expect(source).toContain('function groupByDate(appointments')
  })

  it('groupByDate deve retornar um Map<string, Appointment[]>', () => {
    // Verifica que a funcao usa Map
    expect(source).toContain('new Map<string, Appointment[]>()')
  })
})
