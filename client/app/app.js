
import m from 'mithril';
import prop from 'mithril/stream'

class CustomerService {
    static instance=null;

    // Return singleton
    static get() {
        if(!CustomerService.instance)
            CustomerService.instance=new CustomerService();
        return CustomerService.instance;
    }

    //Bytter ut fetch med m.request for å kunne utnytte automatisk rerendering av DOM ved API-respons
    //m.request har også annen funksjonalitet som automatisk parsing av JSON, avbryting av request m.m
    getCustomers() {
        return m.request({method: "GET", url: "/customers"}).then((customers) => {
            return customers;
        }).catch((err) => {
            throw err.message;
        })
    }

    getCustomer(customerId) {
        return m.request({method: "GET", url: "/customers/"+customerId}).then((customer) => {
            return customer;
        }).catch((err) => {
            throw err.message;
        });
    }

    addCustomer(name, city) {
        return m.request({
            method: "POST",
            url: "/customers",
            data: {name, city}
        }).then((customers) => {
            return customers;
        }).catch((err) => {
            throw err.message;
        })
    }
}
class Menu {
    view(vnode) {
        return  (
                <div>
                    <div>Menu: <a href="/">Customers</a></div>
                    {vnode.children}
                </div>
                )
    }
}

class CustomerListComponent{
    //Setter state i konstruktøren
    //Funksjonen prop genererer getters og setters slik at variablene kan brukes som callback
    constructor(){
        this.customerList = prop([]);
        this.status = prop("");
        this.newCustomerCity = prop("");
        this.newCustomerName = prop("");

    }
    /*
        Oninit kjører etter komponenten er plassert i DOM-treet,
        og garanterer derfor at komponenten blir tegnet på nytt
        etter at dataen er mottatt fra server
    */
    oninit(){
        CustomerService.get().getCustomers().then((customers) => {
            this.customerList(customers);
            this.status("successfully loaded customer list");
        }).catch((reason) => {
            this.status("error: "+reason);
        });
    }
    /*
        Legg merke til at alle variabler er funksjoner (getters)
     */
    onSubmit = (e) => {
        e.preventDefault();
        const name = this.newCustomerName();
        const city = this.newCustomerCity();
        CustomerService.get().addCustomer(name, city).then((id) => {
            this.customerList().push({id, name, city});
            this.status("successfully added new customer");
            this.newCustomerName("");
            this.newCustomerCity("");
        }).catch((reason) => {
            this.status("error: "+reason);
        })
    };

    /*
        View er metoden som bestemmer hva som skal tegnes, veldig lik render() i react.

        JSX her er litt forskjellig fra i React. Her brukes samme attributtnavn som i vanlig HTML (ikke camelCase)

        onchange metoden bruker en wrapper for å slippe e.preventDefault og e.target.value,
        metoden sitt første argument er hva man ønsker av data fra eventet (her verdien)
        og den andre parameteren er callback(attr)

        This peker her på vnode.state

     */
    view(vnode){
        let listItems = this.customerList().map((customer) => {
            return <li key={customer.id}><a href={"/#/customers/"+customer.id}>{customer.name}</a></li>
        });

        return (
            <div>
                {"status: "+this.status}
                <ul>
                    {listItems}
                </ul>
                <form onsubmit={this.onSubmit}>
                    <label>Name:<input type="text" name="name" value={this.newCustomerName}
                                       onchange={m.withAttr('value', this.newCustomerName)}/></label>
                    <label>City:<input type="text" name="city" value={this.newCustomerCity}
                                       onchange={m.withAttr('value', this.newCustomerCity)}/></label>
                    <input type="submit" value="New Customer"/>
                </form>
            </div>
        )
    }
}

class CustomerDetailsComponent {

    constructor() {
        this.status = prop("");
        this.customer = prop({});
    }

    oninit() {
        CustomerService.get().getCustomer(m.route.param('customerId')).then((customer) => {
            this.customer(customer);
            this.status("successfully loaded customer details");
        }).catch((reason) => {
            this.status("error: "+reason)
        })
    }

    view() {
        return (
            <div>status: {this.status()}<br/>
                <ul>
                    <li>name: {this.customer().name}</li>
                    <li>city: {this.customer().city}</li>
                </ul>
            </div>
        )
    }
}


/*
    Definerer komponenter som skal rendres ved de ulike rutene. Bruker kolon
    for path params. Disse kan brukes i komponentene med m.route.param('attr')
    Rendrer alle kommponentene inne i menyen. De andre komponentene blir lagt inn som children
 */
const routes = {
    "/": {
        render: function(){
            return <Menu><CustomerListComponent/></Menu>
        }
    },
    "/customers/:customerId": {
        render: function(){
            return <Menu><CustomerDetailsComponent/></Menu>
        }
    },
};
//Setter samme prefix som de andre eksemplene, kan også bruke prefix("") (ikke kompatibelt med ie9)
m.route.prefix("#");
m.route(document.getElementById("root"), "/", routes);

