export class TestProps {
  static id = (id: string) => ({ 'data-testid': id });
}

// export class TestPropsBuilder {
//     props: Record<string, string>;
//     constructor() {
//         this.props = {};
//     }

//     public id = (id: string /* , opts */) => {
//         this.props = { ...TestProps.id(id /* , opts */) };

//         return this;
//     };

//     public build = () => this.props;
// }
