import * as readline from 'readline';

export const promptChangesConfirmation = () => (
  new Promise((resolve: (b:boolean) => void, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Are you sure you want to execute this change set? [y/N]:', 
      _ => {
        const answer = _.length === 0 ? 'n' : _;

        console.log();
        resolve(/^y/i.test(answer));
        rl.close();
      }
    );
  })
);