import { TimerTaskResult } from "@/types";
import { Task } from "@/structures";

export default class PurgeCalendarTask extends Task {
    constructor() {
        super({
            name: "purgeCalendar",
            cronExpression: "0 0 0 * * *"
        });
    }

    async run(): Promise<TimerTaskResult> {
        const events = await this.client.prisma.calendarEvents.findMany({
            where: {
                endDate: {
                    lte: this.client.utils.getCalendarCutOffDate()
                },
                Guild: {
                    Settings: {
                        some: {
                            type: "CALENDAR_AUTO_DELETE",
                            value: "1"
                        }
                    }
                }
            },
            select: {
                id: true
            }
        });

        const count = await this.client.prisma.calendarEvents.deleteMany({
            where: {
                id: {
                    in: events.map(event => event.id)
                }
            }
        });
        this.client.logger.verbose(`Purged ${count.count} calendar event(s)`);

        // Success
        return { result: "SUCCESS" };
    }
}
