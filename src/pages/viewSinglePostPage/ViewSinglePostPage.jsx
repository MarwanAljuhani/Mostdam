import React, { useContext } from 'react'
import { ViewSinglePost } from '../../components/viewSinglePost/ViewSinglePost'
import { AuthContext } from '../../context/AuthContext';

export const ViewSinglePostPage = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <ViewSinglePost />
  )
}
