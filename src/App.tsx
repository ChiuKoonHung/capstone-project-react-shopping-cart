import React, {useState} from 'react';
import {useQuery} from 'react-query';
import API from "./API"

// Components
import Item from './Item/Item';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import Badge from '@material-ui/core/Badge';
import Cart from './Cart/Cart';

// styles
import { Wrapper, StyledButton } from './App.styles';

// Types
export type CartItemType = {
  id: number,
  title: string,
  price: number,
  category: string,
  description: string,
  image: string,
  amount: number
};

const getProducts = async (): Promise<CartItemType[]> =>
  await (await fetch(API)).json();


function App() {
  const [openCart, setOpenCart] = useState(false);
  const [cartItems, setCartItems] = useState([] as CartItemType[]);

  //fetch data using react-query dependency
  const { data, isLoading, error } = useQuery<CartItemType[]>(
    'products',
    getProducts
  );
  console.log(data);

  const getTotalItems = (items: CartItemType[]) => 
  //return total number of item and use property amount to add up. Ack initial value of 0.
    items.reduce((ack: number, item) => ack + item.amount, 0);

    const handleAddToCart = (clickedItem: CartItemType) => {
      setCartItems(prev => {
        // 1. Is the item already added in the cart?
        const isItemInCart = prev.find(item => item.id === clickedItem.id);
  
        if (isItemInCart) {
          return prev.map(item =>
            item.id === clickedItem.id
              ? { ...item, amount: item.amount + 1 }
              : item
          );
        }
        // First time the item is added
        return [...prev, { ...clickedItem, amount: 1 }];
      });
    };
  
    const handleRemoveFromCart = (id: number) => {
      setCartItems(prev =>
        prev.reduce((ack, item) => {
          if (item.id === id) {
            if (item.amount === 1) return ack;
            return [...ack, { ...item, amount: item.amount - 1 }];
          } else {
            return [...ack, item];
          }
        }, [] as CartItemType[])
      );
    };

  if(isLoading) return <LinearProgress />;
  if(error) return <div>Something went wrong ...</div>;

  return (
    <Wrapper>
      <Drawer anchor='right' open={openCart} onClose={() => setOpenCart(false)}>
        <Cart
          cartItems={cartItems}
          addToCart={handleAddToCart}
          removeFromCart={handleRemoveFromCart}
        />
      </Drawer>
      <StyledButton onClick={() => setOpenCart(true)}>
        <Badge badgeContent={getTotalItems(cartItems)} color='error'>
          <AddShoppingCartIcon />
        </Badge>
      </StyledButton>
      <Grid container spacing={3}>
      {data?.map(item => (
        <Grid item key={item.id} xs={12} sm={3}>
        <Item item={item} handleAddToCart={handleAddToCart} />
        </Grid>
      ))}
      </Grid>
    </Wrapper>
  );
};

export default App;
