export function main() {
  const data = [1, 2, 3];
  
  data.map((item) => {
    const doubled = item * 2;
    return doubled;
  });

  process.action((args) => {
    const local = 'value';
  });
}
