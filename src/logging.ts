export interface MainLoopLogState {
  currentMonthName: string;
  currentMonthProcessed: number;
  monthStartTime: Date;
}

export const log = {
  atAllDone(startTime: Date): void {
    const endTime = new Date();
    console.log("All done");
    console.log(
      `Total processing time: ${Math.ceil(
        (endTime.getTime() - startTime.getTime()) / 1000
      )} seconds`
    );
  },
  atStartOfInvoiceProccessing(
    state: MainLoopLogState,
    monthName: string,
    totalInvoicesForMonth: number
  ): MainLoopLogState {
    const isNewMonth =
      state.currentMonthName === "" || state.currentMonthName !== monthName;

    if (isNewMonth && state.currentMonthName !== "") {
      console.log(
        `[${state.currentMonthName}]: Done in ${Math.ceil(
          (new Date().getTime() - state.monthStartTime.getTime()) / 1000
        )} seconds`
      );
    }

    if (isNewMonth) {
      console.log(
        `Starting ${monthName} with ${totalInvoicesForMonth} invoices`
      );
    }

    if (!isNewMonth && state.currentMonthProcessed % 10 === 0) {
      console.log(
        `[${monthName}]: ${state.currentMonthProcessed} / ${totalInvoicesForMonth}`
      );
    }

    return {
      currentMonthName: monthName,
      currentMonthProcessed: isNewMonth ? 1 : state.currentMonthProcessed + 1,
      monthStartTime: isNewMonth ? new Date() : state.monthStartTime,
    };
  },
};
